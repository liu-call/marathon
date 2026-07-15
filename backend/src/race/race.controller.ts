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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { RaceService } from './race.service'
import { RaceImportService } from './race-import.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'

class CreateRaceDto {
  @IsString() @IsNotEmpty() raceName: string
  @IsString() @IsNotEmpty() raceDate: string
  @IsString() @IsOptional() raceType?: string
  @IsString() @IsOptional() raceLocation?: string
  @IsNumber() @IsOptional() raceDistance?: number
  @IsString() @IsOptional() registrationOpenDate?: string
  @IsString() @IsOptional() registrationCloseDate?: string
  @IsString() @IsOptional() lotteryDate?: string
  @IsString() @IsOptional() lotteryResultDate?: string
  @IsString() @IsOptional() bibNumber?: string
  @IsString() @IsOptional() status?: string
  @IsString() @IsOptional() notes?: string
}

class ParseTextDto {
  @IsString() @IsNotEmpty() text: string
}

class BatchImportDto {
  @IsNotEmpty() dataList: any[]
}

@Controller('races')
@UseGuards(JwtAuthGuard)
export class RaceController {
  constructor(
    private readonly raceService: RaceService,
    private readonly raceImportService: RaceImportService,
  ) {}

  /** 赛事列表 */
  @Get()
  findAll(
    @CurrentUser() userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('raceType') raceType?: string,
    @Query('year') year?: number,
  ) {
    return this.raceService.findAll(userId, { page, limit, status, raceType, year })
  }

  /** 即将开跑（首页倒计时） */
  @Get('upcoming')
  findUpcoming(@CurrentUser() userId: string) {
    return this.raceService.findUpcoming(userId)
  }

  /** 赛事详情 */
  @Get(':id')
  findOne(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.raceService.findOne(userId, id)
  }

  /** 创建赛事 */
  @Post()
  create(@CurrentUser() userId: string, @Body() dto: CreateRaceDto) {
    return this.raceService.create(userId, dto)
  }

  /** 更新赛事 */
  @Put(':id')
  update(@CurrentUser() userId: string, @Param('id') id: string, @Body() dto: Partial<CreateRaceDto>) {
    return this.raceService.update(userId, id, dto)
  }

  /** 删除赛事 */
  @Delete(':id')
  remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.raceService.remove(userId, id)
  }

  /** 语音/文本解析赛事信息 */
  @Post('parse-text')
  async parseText(@Body() dto: ParseTextDto) {
    try {
      return await this.raceImportService.parseText(dto.text)
    } catch (err) {
      throw new HttpException(
        { statusCode: 502, message: 'AI 解析失败，请手动填写或稍后重试', error: err.message },
        502,
      )
    }
  }

  /** 表格解析（上传文件） */
  @Post('parse-spreadsheet')
  @UseInterceptors(FileInterceptor('file'))
  async parseSpreadsheet(@UploadedFile() file: Express.Multer.File) {
    try {
      return await this.raceImportService.parseSpreadsheet(file.buffer)
    } catch (err) {
      throw new HttpException(
        { statusCode: 502, message: '表格解析失败，请检查文件格式', error: err.message },
        502,
      )
    }
  }

  /** 批量导入 */
  @Post('batch-import')
  batchImport(@CurrentUser() userId: string, @Body() dto: BatchImportDto) {
    return this.raceService.batchCreate(userId, dto.dataList)
  }
}
