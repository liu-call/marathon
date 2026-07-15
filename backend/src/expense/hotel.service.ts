import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Hotel } from './hotel.schema'

@Injectable()
export class HotelService {
  constructor(@InjectModel(Hotel.name) private hotelModel: Model<Hotel>) {}

  /** 按赛事查询酒店 */
  async findByRaceId(userId: string, raceId: string): Promise<Hotel[]> {
    return this.hotelModel.find({ userId, raceId }).sort({ checkInDate: 1 })
  }

  /** 用户所有酒店列表 */
  async findAll(userId: string, query: { page?: number; limit?: number; year?: number }) {
    const { page = 1, limit = 20, year } = query
    const filter: any = { userId }
    if (year) {
      filter.checkInDate = { $gte: `${year}-01-01`, $lte: `${year}-12-31` }
    }

    const total = await this.hotelModel.countDocuments(filter)
    const list = await this.hotelModel
      .find(filter)
      .sort({ checkInDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return { list, total, page, limit }
  }

  /** 详情 */
  async findOne(userId: string, id: string): Promise<Hotel> {
    const hotel = await this.hotelModel.findOne({ _id: id, userId })
    if (!hotel) throw new NotFoundException('酒店记录不存在')
    return hotel
  }

  /** 创建 */
  async create(userId: string, data: Partial<Hotel>): Promise<Hotel> {
    const nights = data.nights || this.calcNights(data.checkInDate, data.checkOutDate)
    const price = data.price || 0
    const totalPrice = data.totalPrice || price * nights
    return this.hotelModel.create({ ...data, userId, nights, totalPrice })
  }

  /** 更新 */
  async update(userId: string, id: string, data: Partial<Hotel>): Promise<Hotel> {
    if (data.checkInDate || data.checkOutDate) {
      const existing = await this.hotelModel.findOne({ _id: id, userId })
      if (existing) {
        const checkIn = data.checkInDate || existing.checkInDate
        const checkOut = data.checkOutDate || existing.checkOutDate
        data.nights = this.calcNights(checkIn, checkOut)
        if (data.price !== undefined || existing.price) {
          const price = data.price !== undefined ? data.price : existing.price
          data.totalPrice = data.totalPrice || price * data.nights
        }
      }
    }
    const hotel = await this.hotelModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true },
    )
    if (!hotel) throw new NotFoundException('酒店记录不存在')
    return hotel
  }

  /** 删除 */
  async remove(userId: string, id: string): Promise<void> {
    const result = await this.hotelModel.deleteOne({ _id: id, userId })
    if (result.deletedCount === 0) throw new NotFoundException('酒店记录不存在')
  }

  /** 计算住宿晚数 */
  private calcNights(checkIn?: string, checkOut?: string): number {
    if (!checkIn || !checkOut) return 1
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return days > 0 ? days : 1
  }
}
