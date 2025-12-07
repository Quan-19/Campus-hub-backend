import { Controller, Get, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequireRole } from './decorators/require-role.decorator';
import { UserRole } from './constants/roles.constants';
import { HttpCacheInterceptor } from '../../infrastructure/cache/http-cache.interceptor';

@Controller('roles')
@UseInterceptors(HttpCacheInterceptor)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  /**
   * Get all roles with their users
   * Only admins can access this
   */
  @Get()
  @RequireRole(UserRole.ADMIN)
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  /**
   * Get role by ID with its users
   * Only admins can access this
   */
  @Get(':id')
  @RequireRole(UserRole.ADMIN)
  async getRoleById(@Param('id') roleId: string) {
    return this.rolesService.getRoleById(parseInt(roleId));
  }
}
