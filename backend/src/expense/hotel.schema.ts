import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class Hotel extends Document {
  @Prop({ required: true, index: true })
  userId: string

  @Prop({ required: true })
  raceId: string

  @Prop()
  raceName: string

  @Prop({ required: true })
  hotelName: string

  @Prop()
  checkInDate: string

  @Prop()
  checkOutDate: string

  @Prop({ default: 1 })
  nights: number

  @Prop({ default: 0 })
  price: number

  @Prop({ default: 0 })
  totalPrice: number

  @Prop()
  distanceToStart: string

  @Prop()
  address: string

  @Prop()
  bookingPlatform: string

  @Prop()
  bookingUrl: string

  @Prop({ default: '已预订' })
  status: string // 已预订 | 已入住 | 已退房 | 已取消

  @Prop()
  notes: string

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const HotelSchema = SchemaFactory.createForClass(Hotel)

// 复合索引：按用户 + 赛事查询酒店（GET /hotels/race/:raceId）
HotelSchema.index({ userId: 1, raceId: 1 })
