import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class RaceExpense extends Document {
  @Prop({ required: true, index: true })
  userId: string

  @Prop()
  raceId: string

  @Prop({ required: true })
  raceName: string

  @Prop({ required: true })
  raceDate: string

  @Prop({ type: Object, default: {} })
  expenses: {
    registrationFee: number
    accommodation: number
    transportation: number
    food: number
    gear: number
    other: number
  }

  @Prop({ default: 0 })
  totalAmount: number

  @Prop()
  notes: string

  @Prop()
  year: number

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const RaceExpenseSchema = SchemaFactory.createForClass(RaceExpense)

// 复合索引（对应设计书 §4.2）
RaceExpenseSchema.index({ userId: 1, year: -1 })     // 年度汇总查询
RaceExpenseSchema.index({ userId: 1, raceId: 1 })    // 按赛事查询
