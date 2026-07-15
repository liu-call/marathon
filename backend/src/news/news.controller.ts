import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { NewsService } from './news.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray } from 'class-validator'

class CreateNewsDto {
  @IsString() @IsNotEmpty() title: string
  @IsString() @IsOptional() source?: string
  @IsString() @IsOptional() content?: string
  @IsString() @IsOptional() raceName?: string
  @IsString() @IsOptional() registrationUrl?: string
  @IsString() @IsOptional() imageUrl?: string
  @IsString() @IsOptional() publishDate?: string
  @IsArray() @IsOptional() tags?: string[]
  @IsBoolean() @IsOptional() isOfficial?: boolean
}

class ReviewDto {
  @IsString() @IsNotEmpty() action: 'publish' | 'reject'
}

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /** 资讯列表（公开，但需登录） */
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('tag') tag?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.newsService.findAll({ page, limit, tag, keyword })
  }

  /** 待审核列表（仅管理员）—— 必须放在 /:id 之前 */
  @Get('admin/pending')
  @UseGuards(JwtAuthGuard)
  findPending(
    @CurrentUser('role') role: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (role !== 'admin') throw new ForbiddenException('需要管理员权限')
    return this.newsService.findPendingReview(page, limit)
  }

  /** 资讯详情 */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id)
  }

  /** 创建资讯（仅管理员） */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser('role') role: string, @Body() dto: CreateNewsDto) {
    if (role !== 'admin') throw new ForbiddenException('需要管理员权限')
    return this.newsService.create(dto)
  }

  /** 更新资讯 */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser('role') role: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateNewsDto>,
  ) {
    if (role !== 'admin') throw new ForbiddenException('需要管理员权限')
    return this.newsService.update(id, dto)
  }

  /** 删除资讯 */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser('role') role: string, @Param('id') id: string) {
    if (role !== 'admin') throw new ForbiddenException('需要管理员权限')
    return this.newsService.remove(id)
  }

  /** 审核资讯 */
  @Post(':id/review')
  @UseGuards(JwtAuthGuard)
  review(
    @CurrentUser('role') role: string,
    @Param('id') id: string,
    @Body() dto: ReviewDto,
  ) {
    if (role !== 'admin') throw new ForbiddenException('需要管理员权限')
    return this.newsService.review(id, dto.action)
  }
}
