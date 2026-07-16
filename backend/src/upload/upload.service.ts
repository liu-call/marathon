import { Injectable, Logger } from '@nestjs/common'
import { extname, join } from 'path'
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs'

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)
  private readonly uploadDir = join(process.cwd(), 'uploads')

  constructor() {
    // 确保 uploads 目录存在
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  /**
   * 上传文件到本地
   * @param file multer 文件对象
   * @param folder 存放子目录（如 images/voice/spreadsheets）
   */
  async uploadFile(file: Express.Multer.File, folder = 'common'): Promise<{ url: string; key: string }> {
    const ext = extname(file.originalname) || `.${this.inferExt(file.mimetype)}`
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`
    const fullPath = join(this.uploadDir, filename)

    try {
      // 确保子目录存在
      const subdir = join(this.uploadDir, folder)
      if (!existsSync(subdir)) {
        mkdirSync(subdir, { recursive: true })
      }
      writeFileSync(fullPath, file.buffer)

      // URL 路径（通过 ServeStatic 中间件提供访问）
      const url = `/uploads/${filename}`
      return { url, key: filename }
    } catch (err) {
      this.logger.error('Local upload failed', err)
      throw new Error('文件上传失败')
    }
  }

  /**
   * 批量上传
   */
  async uploadFiles(files: Express.Multer.File[], folder = 'common'): Promise<{ url: string; key: string }[]> {
    return Promise.all(files.map((f) => this.uploadFile(f, folder)))
  }

  /**
   * 删除文件
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const fullPath = join(this.uploadDir, key)
      if (existsSync(fullPath)) {
        unlinkSync(fullPath)
      }
    } catch (err) {
      this.logger.error('Local delete failed', err)
    }
  }

  private inferExt(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/aac': 'aac',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/vnd.ms-excel': 'xls',
      'text/csv': 'csv',
    }
    return map[mimetype] || 'bin'
  }
}
