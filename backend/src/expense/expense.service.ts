import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { RaceExpense } from './expense.schema'

@Injectable()
export class ExpenseService {
  constructor(@InjectModel(RaceExpense.name) private expenseModel: Model<RaceExpense>) {}

  /** 花费列表 */
  async findAll(userId: string, query: { year?: number; page?: number; limit?: number }) {
    const { year, page = 1, limit = 20 } = query
    const filter: any = { userId }
    if (year) filter.year = year

    const total = await this.expenseModel.countDocuments(filter)
    const list = await this.expenseModel
      .find(filter)
      .sort({ raceDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return { list, total, page, limit }
  }

  /** 单场赛事花费 */
  async findByRaceId(userId: string, raceId: string) {
    return this.expenseModel.findOne({ userId, raceId })
  }

  /** 创建/更新赛事花费 */
  async upsert(userId: string, data: Partial<RaceExpense>) {
    const expenses: any = data.expenses || {}
    const totalAmount =
      (expenses.registrationFee || 0) +
      (expenses.accommodation || 0) +
      (expenses.transportation || 0) +
      (expenses.food || 0) +
      (expenses.gear || 0) +
      (expenses.other || 0)

    const year = data.raceDate ? new Date(data.raceDate).getFullYear() : new Date().getFullYear()

    // 先按 raceId 查找，没有则按 (userId + raceName + raceDate) 查找
    let existing: RaceExpense | null = null
    if (data.raceId) {
      existing = await this.expenseModel.findOne({ userId, raceId: data.raceId })
    }
    if (!existing && data.raceName && data.raceDate) {
      existing = await this.expenseModel.findOne({
        userId,
        raceName: data.raceName,
        raceDate: data.raceDate,
      })
    }

    if (existing) {
      return this.expenseModel.findByIdAndUpdate(
        existing._id,
        { $set: { ...data, totalAmount, year } },
        { new: true },
      )
    }

    return this.expenseModel.create({ ...data, userId, totalAmount, year })
  }

  /** 删除 */
  async remove(userId: string, id: string) {
    const result = await this.expenseModel.deleteOne({ _id: id, userId })
    if (result.deletedCount === 0) throw new NotFoundException('花费记录不存在')
  }

  /** 年度花费汇总 */
  async getSummary(userId: string, year: number) {
    const list = await this.expenseModel.find({ userId, year })

    const summary = {
      totalAmount: 0,
      raceCount: list.length,
      breakdown: {
        registrationFee: 0,
        accommodation: 0,
        transportation: 0,
        food: 0,
        gear: 0,
        other: 0,
      },
    }

    list.forEach((item) => {
      summary.totalAmount += item.totalAmount || 0
      const exp = item.expenses || {}
      summary.breakdown.registrationFee += exp.registrationFee || 0
      summary.breakdown.accommodation += exp.accommodation || 0
      summary.breakdown.transportation += exp.transportation || 0
      summary.breakdown.food += exp.food || 0
      summary.breakdown.gear += exp.gear || 0
      summary.breakdown.other += exp.other || 0
    })

    return summary
  }
}
