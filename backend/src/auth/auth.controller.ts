import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { IsString, IsNotEmpty } from 'class-validator'

class LoginDto {
  @IsString()
  @IsNotEmpty()
  code: string
}

class UpdateUserDto {
  @IsString()
  nickName?: string

  @IsString()
  avatarUrl?: string

  @IsString()
  city?: string

  gender?: number
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 微信登录 */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.loginByCode(dto.code)
  }

  /** 刷新 Token */
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Request() req: any) {
    return this.authService.refreshToken(req.user.userId)
  }

  /** 更新用户信息 */
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() dto: UpdateUserDto) {
    return this.authService.updateUserInfo(req.user.userId, dto)
  }
}
