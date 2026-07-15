import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { UploadService } from './upload.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { IsString, IsNotEmpty } from 'class-validator'

class UploadByUrlDto {
  @IsString() @IsNotEmpty() fileName: string

  @IsString() @IsNotEmpty() folder: string
}

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /** 单文件上传（图片/语音/表格等） */
  @Post()
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadByUrlDto,
  ) {
    if (!file) throw new BadRequestException('文件不能为空')
    const folder = body?.folder || 'common'
    return this.uploadService.uploadFile(file, folder)
  }

  /** 多文件上传（最多 10 个，用于多张证书 OCR） */
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, {
    limits: { fileSize: 20 * 1024 * 1024 },
  }))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadByUrlDto,
  ) {
    if (!files || files.length === 0) throw new BadRequestException('文件不能为空')
    const folder = body?.folder || 'common'
    return this.uploadService.uploadFiles(files, folder)
  }
}
