import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

/**
 * 订阅授权记录：用户每次授权订阅消息会写一条
 * 微信订阅消息为一次性授权，发完即失效，需要重新授权
 */
@Schema({ timestamps: true })
export class SubscribeRecord extends Document {
  @Prop({ required: true, index: true })
  userId: string

  @Prop({ required: true })
  templateId: string // 微信订阅消息模板 ID

  @Prop({ default: 'pending' })
  status: string // pending | sent | failed

  @Prop()
  raceId: string // 关联赛事（可选）

  @Prop()
  sentAt: Date

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const SubscribeRecordSchema = SchemaFactory.createForClass(SubscribeRecord)
