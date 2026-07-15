import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ResultService } from './result.service'
import { AiService } from '../ai/ai.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'

class CreateResultDto {
  @IsString() @IsOptional() raceId?: string
  @IsString() @IsNotEmpty() raceName: string
  @IsString() @IsNotEmpty() raceDate: string
  @IsNumber() @IsOptional() raceDistance?: number
  @IsString() @IsOptional() raceType?: string
  @IsString() @IsOptional() finishTime?: string
  @IsString() @IsOptional() gunTime?: string
  @IsString() @IsOptional() netTime?: string
  @IsNumber() @IsOptional() overallRanking?: number
  @IsString() @IsOptional() pace?: string
  @IsString() @IsOptional() weather?: string
  @IsString() @IsOptional() bibNumber?: string
  @IsString() @IsOptional() certificateImageId?: string
  @IsString() @IsOptional() notes?: string
  @IsOptional() splits?: { km: number; time: string }[]
}

class ParseImageDto {
  @IsString() @IsNotEmpty() imageUrl: string
}

@Controller('results')
@UseGuards(JwtAuthGuard)
export class ResultController {
  constructor(
    private readonly resultService: ResultService,
    private readonly aiService: AiService,
  ) {}

  @Get()
  findAll(
    @CurrentUser() userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('raceType') raceType?: string,
    @Query('year') year?: number,
    @Query('raceId') raceId?: string,
  ) {
    return this.resultService.findAll(userId, { page, limit, raceType, year, raceId })
  }

  @Get('summary')
  getSummary(@CurrentUser() userId: string, @Query('year') year?: number) {
    return this.resultService.getSummary(userId, year ? Number(year) : undefined)
  }

  @Get('pb')
  getPBs(@CurrentUser() userId: string) {
    return this.resultService.getAllPBs(userId)
  }

  @Get(':id')
  findOne(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.resultService.findOne(userId, id)
  }

  @Post()
  create(@CurrentUser() userId: string, @Body() dto: CreateResultDto) {
    return this.resultService.create(userId, { ...dto, sourceType: 'manual' })
  }

  @Put(':id')
  update(@CurrentUser() userId: string, @Param('id') id: string, @Body() dto: Partial<CreateResultDto>) {
    return this.resultService.update(userId, id, dto)
  }

  @Delete(':id')
  remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.resultService.remove(userId, id)
  }

  /** 成绩证书 OCR 识别 */
  @Post('parse-image')
  async parseImage(@Body() dto: ParseImageDto) {
    try {
      return await this.aiService.parseResultCertificate(dto.imageUrl)
    } catch (err) {
      throw new HttpException(
        { statusCode: 502, message: '证书识别失败，请稍后重试或手动录入', error: err.message },
        502,
      )
    }
  }
}
