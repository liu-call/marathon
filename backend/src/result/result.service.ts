import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Result } from './result.schema'

@Injectable()
export class ResultService {
  constructor(@InjectModel(Result.name) private resultModel: Model<Result>) {}

  /** 成绩列表 */
  async findAll(
    userId: string,
    query: { page?: number; limit?: number; raceType?: string; year?: number; raceId?: string },
  ) {
    const { page = 1, limit = 20, raceType, year, raceId } = query
    const filter: any = { userId }
    if (raceType) filter.raceType = raceType
    if (raceId) filter.raceId = raceId
    if (year) {
      filter.raceDate = { $gte: `${year}-01-01`, $lte: `${year}-12-31` }
    }

    const total = await this.resultModel.countDocuments(filter)
    const list = await this.resultModel
      .find(filter)
      .sort({ raceDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return { list, total, page, limit }
  }

  /** 成绩详情 */
  async findOne(userId: string, id: string): Promise<Result> {
    const result = await this.resultModel.findOne({ _id: id, userId })
    if (!result) throw new NotFoundException('成绩不存在')
    return result
  }

  /** 创建成绩（自动检测 PB） */
  async create(userId: string, data: Partial<Result>): Promise<Result> {
    // 计算 finishTimeSeconds
    if (data.finishTime && !data.finishTimeSeconds) {
      data.finishTimeSeconds = this.timeToSeconds(data.finishTime)
    }

    // 检查是否为 PB
    const raceType = data.raceType || '全程马拉松'
    const existingPB = await this.getPbByType(userId, raceType)
    const newTime = data.finishTimeSeconds || 0

    if (!existingPB || (newTime > 0 && newTime < existingPB.finishTimeSeconds)) {
      data.isPB = true
      // 取消之前的 PB 标记
      await this.resultModel.updateMany(
        { userId, raceType, isPB: true },
        { $set: { isPB: false } },
      )
    } else {
      data.isPB = false
    }

    return this.resultModel.create({ ...data, userId })
  }

  /** 更新成绩 */
  async update(userId: string, id: string, data: Partial<Result>): Promise<Result> {
    if (data.finishTime && !data.finishTimeSeconds) {
      data.finishTimeSeconds = this.timeToSeconds(data.finishTime)
    }
    const result = await this.resultModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true },
    )
    if (!result) throw new NotFoundException('成绩不存在')
    return result
  }

  /** 删除成绩 */
  async remove(userId: string, id: string): Promise<void> {
    const result = await this.resultModel.deleteOne({ _id: id, userId })
    if (result.deletedCount === 0) throw new NotFoundException('成绩不存在')
  }

  /** 获取 PB（按类型：全程马拉松 / 半程马拉松） */
  async getPbByType(userId: string, raceType: string): Promise<Result | null> {
    return this.resultModel
      .findOne({ userId, raceType, finishTimeSeconds: { $gt: 0 } })
      .sort({ finishTimeSeconds: 1 })
      .exec()
  }

  /** 获取所有 PB */
  async getAllPBs(userId: string) {
    const fullPb = await this.getPbByType(userId, '全程马拉松')
    const halfPb = await this.getPbByType(userId, '半程马拉松')
    return {
      fullMarathon: fullPb ? { finishTime: fullPb.finishTime, raceName: fullPb.raceName, raceDate: fullPb.raceDate } : null,
      halfMarathon: halfPb ? { finishTime: halfPb.finishTime, raceName: halfPb.raceName, raceDate: halfPb.raceDate } : null,
    }
  }

  /** 成绩汇总统计 */
  async getSummary(userId: string, year?: number) {
    const filter: any = { userId }
    if (year) {
      filter.raceDate = { $gte: `${year}-01-01`, $lte: `${year}-12-31` }
    }

    const results = await this.resultModel.find(filter).sort({ raceDate: 1 })

    if (results.length === 0) {
      return { totalRaces: 0, finishRate: 0, avgTime: null, pbs: await this.getAllPBs(userId) }
    }

    const fullMarathon = results.filter((r) => r.raceType === '全程马拉松')
    const halfMarathon = results.filter((r) => r.raceType === '半程马拉松')
    const totalDistance = results.reduce((sum, r) => sum + (r.raceDistance || 0), 0)

    const finishedRaces = results.filter((r) => r.finishTimeSeconds > 0)
    const avgSeconds =
      finishedRaces.length > 0
        ? Math.floor(finishedRaces.reduce((sum, r) => sum + r.finishTimeSeconds, 0) / finishedRaces.length)
        : 0

    return {
      totalRaces: results.length,
      fullMarathonCount: fullMarathon.length,
      halfMarathonCount: halfMarathon.length,
      finishRate: results.length > 0 ? Math.round((finishedRaces.length / results.length) * 100) : 0,
      totalDistance: Math.round(totalDistance * 100) / 100,
      avgTime: avgSeconds > 0 ? this.secondsToTime(avgSeconds) : null,
      pbs: await this.getAllPBs(userId),
      pbBreakthroughs: results.filter((r) => r.isPB).length,
    }
  }

  /** 时间字符串转秒数 */
  private timeToSeconds(time: string): number {
    const parts = time.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return 0
  }

  /** 秒数转时间字符串 */
  private secondsToTime(seconds: number): string {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
}
