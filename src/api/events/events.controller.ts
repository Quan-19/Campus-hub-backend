import {Controller,Get,Post,Put,Delete,Body,Query,Param,NotFoundException,BadRequestException,UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { HttpCacheInterceptor } from '../../infrastructure/cache/http-cache.interceptor';

@Controller('events')
@UseInterceptors(HttpCacheInterceptor)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('size') size = 10,
    @Query('keyword') keyword?: string,
  ) {
    return this.eventsService.findAll(+page, +size, keyword);
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) throw new BadRequestException('ID phải là số');

    const event = await this.eventsService.findOne(eventId);
    if (!event) throw new NotFoundException(`Event ${id} không tồn tại`);

    const registrations = await this.eventsService.getRegistrations(eventId);

    return {
      ...event,
      status: String(event.status),
      registrations,
    };
  }

  @Post()
  async create(@Body() body: any) {
    return this.eventsService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const eventId = parseInt(id, 10);
    return this.eventsService.update(eventId, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const eventId = parseInt(id, 10);
    return this.eventsService.remove(eventId);
  }
}