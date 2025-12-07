import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { CacheService } from './cache.service';
import { RequireRole } from '../../api/auth/decorators/require-role.decorator';
import { UserRole } from '../../api/auth/constants/roles.constants';

@Controller('cache')
export class CacheController {
  constructor(private cacheService: CacheService) {}

  /**
   * Clear specific cache key (Admin only)
   */
  @Delete(':key')
  @RequireRole(UserRole.ADMIN)
  async clearCacheKey(@Param('key') key: string) {
    await this.cacheService.del(key);
    return { message: `Cache key '${key}' cleared successfully` };
  }

  /**
   * Clear all cache (Admin only)
   */
  @Post('reset')
  @RequireRole(UserRole.ADMIN)
  async resetCache() {
    await this.cacheService.reset();
    return { message: 'All cache cleared successfully' };
  }

  /**
   * Clear events cache (Admin/Staff only)
   */
  @Post('events/clear')
  @RequireRole(UserRole.STAFF, UserRole.ADMIN)
  async clearEventsCache() {
    await this.cacheService.delPattern('events:*');
    return { message: 'Events cache cleared successfully' };
  }

  /**
   * Clear roles cache (Admin only)
   */
  @Post('roles/clear')
  @RequireRole(UserRole.ADMIN)
  async clearRolesCache() {
    await this.cacheService.del('roles:all');
    return { message: 'Roles cache cleared successfully' };
  }
}
