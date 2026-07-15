import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Race } from './race.schema'

@Injectable()
export class RaceService {
  constructor(@InjectModel(Race.name) private raceModel: Model<Race>) {}

  /** 查询赛事列表（分页 + 筛选） */
  async findAll(
    userId: string,
    query: {
      page?: number
      limit?: number
      status?: string
      raceType?: string
      year?: number
    },
  ) {
    const { page = 1, limit = 20, status, raceType, year } = query
    const filter: any = { userId }

    if (status) filter.status = status
    if (raceType) filter.raceType = raceType
    if (year) {
      const start = `${year}-01-01`
      const end = `${year}-12-31`
      filter.raceDate = { $gte: start, $lte: end }
    }

    const total = await this.raceModel.countDocuments(filter)
    const list = await this.raceModel
      .find(filter)
      .sort({ raceDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec()

    return { list, total, page, limit }
  }

  /** 获取赛事详情 */
  async findOne(userId: string, id: string): Promise<Race> {
    const race = await this.raceModel.findOne({ _id: id, userId })
    if (!race) throw new NotFoundException('赛事不存在')
    return race
  }

  /** 创建赛事 */
  async create(userId: string, data: Partial<Race> & { sourceType?: string }): Promise<Race> {
    return this.raceModel.create({ ...data, userId, sourceType: data.sourceType || 'manual' })
  }

  /** 更新赛事 */
  async update(userId: string, id: string, data: Partial<Race>): Promise<Race> {
    const race = await this.raceModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true },
    )
    if (!race) throw new NotFoundException('赛事不存在')
    return race
  }

  /** 删除赛事 */
  async remove(userId: string, id: string): Promise<void> {
    const result = await this.raceModel.deleteOne({ _id: id, userId })
    if (result.deletedCount === 0) throw new NotFoundException('赛事不存在')
  }

  /** 批量创建（表格导入用） */
  async batchCreate(userId: string, dataList: Partial<Race>[]) {
    let successCount = 0
    let failCount = 0
    const failedRows: { rowIndex: number; reason: string }[] = []

    for (let i = 0; i < dataList.length; i++) {
      try {
        await this.raceModel.create({ ...dataList[i], userId, sourceType: 'spreadsheet' })
        successCount++
      } catch (err) {
        failCount++
        failedRows.push({ rowIndex: i + 2, reason: err.message })
      }
    }

    return { successCount, failCount, failedRows }
  }

  /** 获取即将截止报名的赛事（首页倒计时用） */
  async findUpcoming(userId: string, limit = 5): Promise<Race[]> {
    const today = new Date().toISOString().slice(0, 10)
    return this.raceModel
      .find({
        userId,
        status: { $in: ['待报名', '已报名', '已中签'] },
        raceDate: { $gte: today },
      })
      .sort({ raceDate: 1 })
      .limit(limit)
      .exec()
  }
}
