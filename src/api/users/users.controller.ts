import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireRole } from '../auth/decorators/require-role.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/constants/roles.constants';
import { HttpCacheInterceptor } from '../../infrastructure/cache/http-cache.interceptor';
import { NoCache } from '../../infrastructure/cache/http-cache.decorator';
import { AssignRoleDto } from './dto/assign-role.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
@UseInterceptors(HttpCacheInterceptor)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get all users (admin only)
   */
  @Get()
  @RequireRole(UserRole.ADMIN)
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @NoCache() // User-specific data should not be cached
  async getCurrentUser(@CurrentUser() user: any) {
    return {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
    };
  }

  /**
   * Assign role to user (admin only)
   * Example: POST /users/1/role with body { "role": "ADMIN" }
   */
  @Post(':id/role')
  @RequireRole(UserRole.ADMIN)
  async assignRole(
    @Param('id') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.usersService.assignRoleByName(parseInt(userId), assignRoleDto.role);
  }
}
