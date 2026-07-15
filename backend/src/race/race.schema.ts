import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Race extends Document {
  @Prop({ required: true, index: true })
  userId: string

  @Prop({ required: true })
  raceName: string

  @Prop({ required: true })
  raceDate: string

  @Prop({ default: '全程马拉松' })
  raceType: string // 全程马拉松 | 半程马拉松 | 10km

  @Prop()
  raceLocation: string

  @Prop({ default: 42.195 })
  raceDistance: number

  @Prop()
  registrationOpenDate: string

  @Prop()
  registrationCloseDate: string

  @Prop()
  lotteryDate: string

  @Prop()
  lotteryResultDate: string

  @Prop()
  bibNumber: string

  @Prop({ default: '待报名' })
  status: string // 待报名 | 已报名 | 未中签 | 已中签 | 已完成 | 已弃赛

  @Prop()
  notes: string

  @Prop({ default: 'manual' })
  sourceType: string // manual | voice | spreadsheet

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const RaceSchema = SchemaFactory.createForClass(Race)

// 复合索引（对应设计书 §4.2）
RaceSchema.index({ userId: 1, raceDate: -1 })   // 按用户查询 + 日期倒序
RaceSchema.index({ raceDate: -1, status: 1 })    // 按日期 + 状态筛选
