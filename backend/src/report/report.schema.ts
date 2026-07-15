import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class AnnualReport extends Document {
  @Prop({ required: true, index: true })
  userId: string

  @Prop({ required: true })
  year: number

  @Prop({ type: Object, default: {} })
  summary: {
    totalRaces: number
    finishedRaces: number
    finishRate: number
    totalDistance: number
    pbBreakthroughs: number
    fullMarathonCount: number
    halfMarathonCount: number
  }

  @Prop({ type: Object, default: {} })
  highlights: {
    fullPB: string
    halfPB: string
    fastestRace: string
    improvement: string
  }

  @Prop({ type: Array, default: [] })
  races: string[] // 赛事 ID 数组

  @Prop({ default: 0 })
  totalExpense: number

  @Prop({ type: Object, default: {} })
  expenseBreakdown: Record<string, number>

  @Prop({ type: Object, default: {} })
  monthlyDistribution: Record<string, number>

  @Prop({ default: '' })
  aiSummary: string

  @Prop()
  shareImage: string // 分享长图 URL

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const AnnualReportSchema = SchemaFactory.createForClass(AnnualReport)

// 复合索引：用户 + 年份唯一
AnnualReportSchema.index({ userId: 1, year: -1 }, { unique: true })
