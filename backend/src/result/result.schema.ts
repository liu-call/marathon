import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Result extends Document {
  @Prop({ required: true, index: true })
  userId: string

  @Prop()
  raceId: string

  @Prop({ required: true })
  raceName: string

  @Prop({ required: true })
  raceDate: string

  @Prop({ default: 42.195 })
  raceDistance: number

  @Prop({ default: '全程马拉松' })
  raceType: string // 全程马拉松 | 半程马拉松

  @Prop()
  finishTime: string // HH:MM:SS

  @Prop()
  finishTimeSeconds: number

  @Prop()
  gunTime: string

  @Prop()
  netTime: string

  @Prop()
  overallRanking: number

  @Prop()
  categoryRanking: number

  @Prop()
  pace: string // MM:SS/km

  @Prop()
  weather: string

  @Prop()
  bibNumber: string

  @Prop()
  certificateImageId: string // 对象存储 URL

  @Prop({ default: false })
  isPB: boolean

  @Prop()
  notes: string

  @Prop({ type: Array, default: [] })
  splits: { km: number; time: string }[]

  @Prop({ default: 'manual' })
  sourceType: string // manual | ocr

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const ResultSchema = SchemaFactory.createForClass(Result)

// 复合索引（对应设计书 §4.2）
ResultSchema.index({ userId: 1, raceDate: -1 })                    // 按用户查询 + 日期倒序
ResultSchema.index({ userId: 1, raceType: 1, finishTimeSeconds: 1 }) // PB 计算用
ResultSchema.index({ userId: 1, raceId: 1 })                       // 按赛事查询成绩
