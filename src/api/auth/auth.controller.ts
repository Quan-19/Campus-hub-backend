import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(@Req() req: any): Promise<AuthResponseDto> {
    return this.authService.refresh(req.user.user_id);
  }

  @Post('logout')
  @UseGuards(JwtRefreshAuthGuard)
  async logout(@Body() refreshTokenDto: RefreshTokenDto): Promise<{ message: string }> {
    await this.authService.revokeRefreshToken(refreshTokenDto.refresh_token);
    return { message: 'Logged out successfully' };
  }
}
