import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CacheService } from '../../infrastructure/cache/cache.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async findAll(page = 1, size = 10, keyword?: string) {
    const cacheKey = `events:list:${page}:${size}:${keyword || 'all'}`;
    
    // Try to get from cache (TTL: 2 minutes)
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * size;
        const where = keyword ? { name: { contains: keyword, mode: 'insensitive' } } : {};

        const [data, total] = await Promise.all([
          this.prisma.event.findMany({
            where,
            skip,
            take: size,
            include: { creator: { select: { name: true } } },
            orderBy: { start_time: 'desc' },
          }),
          this.prisma.event.count({ where }),
        ]);

        return { data, total, page: +page, size: +size };
      },
      120000, // 2 minutes
    );
  }

  async findOne(id: number) {
    const cacheKey = `events:${id}`;
    
    // Try to get from cache (TTL: 5 minutes)
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.event.findUnique({
          where: { event_id: id },
          include: { creator: { select: { name: true, email: true } } },
        });
      },
      300000, // 5 minutes
    );
  }

  async getRegistrations(eventId: number) {
    const cacheKey = `events:${eventId}:registrations`;
    
    // Try to get from cache (TTL: 1 minute for frequently changing data)
    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        // DÙNG $queryRaw ĐỂ TRÁNH PRISMA ÉP KIỂU ENUM → AN TOÀN TUYỆT ĐỐI
        const result = await this.prisma.$queryRaw<
          Array<{
            registration_id: number;
            status: string;
            qr_code: string | null;
            checked_in_at: Date | null;
            name: string;
            email: string;
          }>
        >`
          SELECT 
            r.registration_id,
            CAST(r.status AS CHAR) as status,
            r.qr_code,
            r.checked_in_at,
            u.name,
            u.email
          FROM registrations r
          JOIN users u ON r.user_id = u.user_id
          WHERE r.event_id = ${eventId}
        `;

        return result.map(r => ({
          registration_id: r.registration_id,
          status: r.status,
          qr_code: r.qr_code,
          checked_in_at: r.checked_in_at,
          user: { name: r.name, email: r.email },
        }));
      },
      60000, // 1 minute
    );
  }

  async create(data: any) {
    const event = await this.prisma.event.create({
      data: { ...data, created_by: data.created_by ?? 2 },
      include: { creator: { select: { name: true } } },
    });
    
    // Invalidate list cache
    await this.cacheService.delPattern('events:list:*');
    
    return event;
  }

  async update(id: number, data: any) {
    await this.prisma.event.findUniqueOrThrow({ where: { event_id: id } });
    const event = await this.prisma.event.update({
      where: { event_id: id },
      data,
      include: { creator: { select: { name: true } } },
    });
    
    // Invalidate specific event cache and list cache
    await this.cacheService.del(`events:${id}`);
    await this.cacheService.delPattern('events:list:*');
    
    return event;
  }

  async remove(id: number) {
    await this.prisma.event.findUniqueOrThrow({ where: { event_id: id } });
    await this.prisma.event.delete({ where: { event_id: id } });
    
    // Invalidate specific event cache and list cache
    await this.cacheService.del(`events:${id}`);
    await this.cacheService.del(`events:${id}:registrations`);
    await this.cacheService.delPattern('events:list:*');
    
    return { message: `Event ${id} đã được loại bỏ thành công` };
  }
}