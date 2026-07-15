import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { NotifyService } from './notify.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

class SubscribeDto {
  @IsString() @IsNotEmpty() templateId: string

  @IsString() @IsOptional() raceId?: string
}

@Controller('notify')
@UseGuards(JwtAuthGuard)
export class NotifyController {
  constructor(private readonly notifyService: NotifyService) {}

  /** 记录用户订阅授权 */
  @Post('subscribe')
  recordSubscribe(@CurrentUser() userId: string, @Body() dto: SubscribeDto) {
    return this.notifyService.recordSubscribe(userId, dto.templateId, dto.raceId)
  }
}
