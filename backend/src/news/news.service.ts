import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { News } from './news.schema'

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<News>) {}

  /**
   * 资讯列表（已登录用户可读已发布资讯）
   */
  async findAll(query: { page?: number; limit?: number; tag?: string; keyword?: string }) {
    const { page = 1, limit = 20, tag, keyword } = query
    const filter: any = { status: 'published' }

    if (tag) filter.tags = tag
    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { raceName: { $regex: keyword, $options: 'i' } },
      ]
    }

    const total = await this.newsModel.countDocuments(filter)
    const list = await this.newsModel
      .find(filter)
      .sort({ publishDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return { list, total, page, limit }
  }

  /** 资讯详情 */
  async findOne(id: string): Promise<News> {
    const news = await this.newsModel.findById(id)
    if (!news) throw new NotFoundException('资讯不存在')
    return news
  }

  /**
   * 创建资讯（仅管理员）
   */
  async create(data: Partial<News>): Promise<News> {
    return this.newsModel.create({
      ...data,
      sourceType: data.sourceType || 'manual',
      status: data.status || 'published',
    })
  }

  /** 更新资讯 */
  async update(id: string, data: Partial<News>): Promise<News> {
    const news = await this.newsModel.findByIdAndUpdate(id, { $set: data }, { new: true })
    if (!news) throw new NotFoundException('资讯不存在')
    return news
  }

  /** 删除资讯 */
  async remove(id: string): Promise<void> {
    const result = await this.newsModel.deleteOne({ _id: id })
    if (result.deletedCount === 0) throw new NotFoundException('资讯不存在')
  }

  /**
   * 审核资讯：pending_review → published
   */
  async review(id: string, action: 'publish' | 'reject'): Promise<News> {
    const news = await this.newsModel.findById(id)
    if (!news) throw new NotFoundException('资讯不存在')
    if (action === 'publish') {
      news.status = 'published'
    } else {
      // 拒绝：直接删除
      await this.newsModel.deleteOne({ _id: id })
      return news
    }
    return news.save()
  }

  /**
   * 待审核列表（仅管理员用）
   */
  async findPendingReview(page = 1, limit = 20) {
    const filter = { status: 'pending_review' }
    const total = await this.newsModel.countDocuments(filter)
    const list = await this.newsModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    return { list, total, page, limit }
  }
}
