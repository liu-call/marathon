import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ReportService } from './report.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { IsNumber, IsOptional, IsString } from 'class-validator'

class GenerateReportDto {
  @IsNumber()
  year: number
}

class ShareImageDto {
  @IsString()
  shareImage: string
}

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /** 生成/刷新年度报告 */
  @Post('annual')
  generateAnnual(@CurrentUser() userId: string, @Body() dto: GenerateReportDto) {
    return this.reportService.generateAnnualReport(userId, dto.year)
  }

  /** 获取年度报告 */
  @Get('annual/:year')
  getAnnual(@CurrentUser() userId: string, @Param('year') year: string) {
    return this.reportService.getAnnualReport(userId, Number(year))
  }

  /** 历史年度报告列表 */
  @Get()
  listReports(@CurrentUser() userId: string) {
    return this.reportService.listReports(userId)
  }

  /** 更新分享长图 */
  @Post('annual/:year/share')
  updateShareImage(
    @CurrentUser() userId: string,
    @Param('year') year: string,
    @Body() dto: ShareImageDto,
  ) {
    return this.reportService.updateShareImage(userId, Number(year), dto.shareImage)
  }
}
