import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AnnualReport } from './report.schema'
import { Result } from '../result/result.schema'
import { RaceExpense } from '../expense/expense.schema'
import { Race } from '../race/race.schema'
import { AiService } from '../ai/ai.service'

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name)

  constructor(
    @InjectModel(AnnualReport.name) private reportModel: Model<AnnualReport>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
    @InjectModel(RaceExpense.name) private expenseModel: Model<RaceExpense>,
    @InjectModel(Race.name) private raceModel: Model<Race>,
    private readonly aiService: AiService,
  ) {}

  /**
   * 生成年度报告
   */
  async generateAnnualReport(userId: string, year: number): Promise<AnnualReport> {
    const [results, expenses, races] = await Promise.all([
      this.resultModel
        .find({
          userId,
          raceDate: { $gte: `${year}-01-01`, $lte: `${year}-12-31` },
        })
        .sort({ raceDate: 1 }),
      this.expenseModel.find({ userId, year }),
      this.raceModel
        .find({
          userId,
          raceDate: { $gte: `${year}-01-01`, $lte: `${year}-12-31` },
        })
        .sort({ raceDate: 1 }),
    ])

    const summary = this.buildSummary(results, year)
    const highlights = await this.buildHighlights(userId, results)
    const expenseStats = this.buildExpenseStats(expenses)
    const monthlyDistribution = this.buildMonthlyDistribution(results)

    // AI 年度感言
    let aiSummary = ''
    try {
      aiSummary = await this.aiService.genAnnualSummary({
        year,
        summary,
        highlights,
        races: races.map((r) => ({ name: r.raceName, date: r.raceDate, type: r.raceType })),
      })
    } catch (err) {
      this.logger.warn('AI 感言生成失败，使用默认文案', err)
      aiSummary = `${year}年你参加了${summary.totalRaces}场比赛，累计跑量${summary.totalDistance}km，继续奔跑，下一年的精彩等你创造！`
    }

    // 删除已有报告后重新生成（保证幂等）
    await this.reportModel.deleteOne({ userId, year })

    return this.reportModel.create({
      userId,
      year,
      summary,
      highlights,
      races: results.map((r) => r._id.toString()),
      totalExpense: expenseStats.total,
      expenseBreakdown: expenseStats.breakdown,
      monthlyDistribution,
      aiSummary,
    })
  }

  /** 获取年度报告 */
  async getAnnualReport(userId: string, year: number): Promise<AnnualReport> {
    const report = await this.reportModel.findOne({ userId, year })
    if (!report) throw new NotFoundException(`${year} 年度报告不存在，请先生成`)
    return report
  }

  /** 获取所有历史年度报告列表 */
  async listReports(userId: string) {
    return this.reportModel.find({ userId }).sort({ year: -1 })
  }

  /** 更新分享长图 */
  async updateShareImage(userId: string, year: number, shareImage: string) {
    const report = await this.reportModel.findOneAndUpdate(
      { userId, year },
      { $set: { shareImage } },
      { new: true },
    )
    if (!report) throw new NotFoundException(`${year} 年度报告不存在`)
    return report
  }

  /** 构建年度概览 */
  private buildSummary(results: Result[], year: number) {
    const finished = results.filter((r) => r.finishTimeSeconds && r.finishTimeSeconds > 0)
    const fullMarathon = results.filter((r) => r.raceType === '全程马拉松')
    const halfMarathon = results.filter((r) => r.raceType === '半程马拉松')
    const totalDistance = results.reduce((sum, r) => sum + (r.raceDistance || 0), 0)
    const pbBreakthroughs = results.filter((r) => r.isPB).length

    return {
      totalRaces: results.length,
      finishedRaces: finished.length,
      finishRate: results.length > 0 ? Math.round((finished.length / results.length) * 100) : 0,
      totalDistance: Math.round(totalDistance * 100) / 100,
      pbBreakthroughs,
      fullMarathonCount: fullMarathon.length,
      halfMarathonCount: halfMarathon.length,
    }
  }

  /** 构建成绩亮点 */
  private async buildHighlights(userId: string, results: Result[]) {
    const fullPb = results
      .filter((r) => r.raceType === '全程马拉松' && r.finishTimeSeconds > 0)
      .sort((a, b) => a.finishTimeSeconds - b.finishTimeSeconds)[0]
    const halfPb = results
      .filter((r) => r.raceType === '半程马拉松' && r.finishTimeSeconds > 0)
      .sort((a, b) => a.finishTimeSeconds - b.finishTimeSeconds)[0]
    // 最快配速：配速越小越快，需把 "MM:SS" 转秒数比较
    const fastest = results
      .filter((r) => r.pace)
      .sort((a, b) => this.paceToSeconds(a.pace) - this.paceToSeconds(b.pace))[0]

    // 与上一年对比
    const lastYear = results.length > 0 ? new Date(results[0].raceDate).getFullYear() - 1 : new Date().getFullYear() - 1
    const lastYearPb = await this.resultModel
      .findOne({
        userId,
        raceType: '全程马拉松',
        finishTimeSeconds: { $gt: 0 },
        raceDate: { $gte: `${lastYear}-01-01`, $lte: `${lastYear}-12-31` },
      })
      .sort({ finishTimeSeconds: 1 })

    let improvement = '暂无去年数据对比'
    if (fullPb && lastYearPb) {
      const diff = lastYearPb.finishTimeSeconds - fullPb.finishTimeSeconds
      if (diff > 0) {
        improvement = `较去年PB提升${this.formatDiff(diff)}`
      } else if (diff < 0) {
        improvement = `较去年PB退步${this.formatDiff(-diff)}`
      } else {
        improvement = '与去年PB持平'
      }
    }

    return {
      fullPB: fullPb?.finishTime || null,
      halfPB: halfPb?.finishTime || null,
      fastestRace: fastest?.raceName || null,
      improvement,
    }
  }

  /** 构建花费统计 */
  private buildExpenseStats(expenses: RaceExpense[]) {
    const breakdown: Record<string, number> = {
      报名: 0,
      住宿: 0,
      交通: 0,
      餐饮: 0,
      装备: 0,
      其他: 0,
    }
    let total = 0

    expenses.forEach((e) => {
      const exp = e.expenses || ({} as any)
      breakdown.报名 += exp.registrationFee || 0
      breakdown.住宿 += exp.accommodation || 0
      breakdown.交通 += exp.transportation || 0
      breakdown.餐饮 += exp.food || 0
      breakdown.装备 += exp.gear || 0
      breakdown.其他 += exp.other || 0
      total += e.totalAmount || 0
    })

    return { total, breakdown }
  }

  /** 构建月度分布 */
  private buildMonthlyDistribution(results: Result[]): Record<string, number> {
    const dist: Record<string, number> = {}
    for (let i = 1; i <= 12; i++) dist[String(i)] = 0

    results.forEach((r) => {
      const month = new Date(r.raceDate).getMonth() + 1
      if (month >= 1 && month <= 12) {
        dist[String(month)] = (dist[String(month)] || 0) + 1
      }
    })

    return dist
  }

  private formatDiff(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    if (m > 0) return `${m}分${s}秒`
    return `${s}秒`
  }

  /** 配速 "MM:SS" 转秒数，用于比较 */
  private paceToSeconds(pace: string): number {
    if (!pace) return Number.MAX_SAFE_INTEGER
    const parts = pace.split(':').map(Number)
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    return Number.MAX_SAFE_INTEGER
  }
}
