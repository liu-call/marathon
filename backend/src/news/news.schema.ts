import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class News extends Document {
  @Prop({ required: true })
  title: string

  @Prop()
  source: string

  @Prop({ default: 'manual' })
  sourceType: string // crawl | manual

  @Prop()
  content: string

  @Prop()
  raceName: string

  @Prop()
  registrationUrl: string

  @Prop()
  imageUrl: string

  @Prop({ index: true })
  publishDate: string

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ default: false })
  isOfficial: boolean

  @Prop()
  crawlSource: string

  @Prop({ unique: true, sparse: true })
  crawlUrl: string

  @Prop({ default: 'published' })
  status: string // published | pending_review

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const NewsSchema = SchemaFactory.createForClass(News)

// 复合索引
NewsSchema.index({ publishDate: -1, status: 1 })  // 列表查询常用
