import { Injectable, Logger } from '@nestjs/common'
import COS from 'cos-nodejs-sdk-v5'
import { extname } from 'path'

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)
  private readonly cos: COS
  private readonly bucket = process.env.COS_BUCKET || ''
  private readonly region = process.env.COS_REGION || ''

  constructor() {
    this.cos = new COS({
      SecretId: process.env.COS_SECRET_ID || '',
      SecretKey: process.env.COS_SECRET_KEY || '',
    })
  }

  /**
   * 上传文件到 COS
   * @param file multer 文件对象
   * @param folder 存放目录（如 images/voice/spreadsheets）
   */
  async uploadFile(file: Express.Multer.File, folder = 'common'): Promise<{ url: string; key: string }> {
    const ext = extname(file.originalname) || `.${this.inferExt(file.mimetype)}`
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`

    try {
      await this.cos.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
      })

      const url = `https://${this.bucket}.cos.${this.region}.myqcloud.com/${filename}`
      return { url, key: filename }
    } catch (err) {
      this.logger.error('COS upload failed', err)
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
      await this.cos.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      })
    } catch (err) {
      this.logger.error('COS delete failed', err)
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
