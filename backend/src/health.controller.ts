import { Controller, Get } from '@nestjs/common'

/**
 * 健康检查端点（无鉴权）
 * GET /api/health
 */
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    }
  }
}
