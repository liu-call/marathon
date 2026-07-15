import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import axios from 'axios'
import { SubscribeRecord } from './notify.schema'
import { Race } from '../race/race.schema'
import { User } from '../auth/user.schema'

/**
 * 订阅消息模板 ID（需要在小程序后台创建后填入环境变量）
 * - 报名截止提醒：NOTIFY_TPL_REG_CLOSE
 * - 抽签结果提醒：NOTIFY_TPL_LOTTERY
 * - 比赛提醒：NOTIFY_TPL_RACE_DAY
 */
@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name)

  constructor(
    @InjectModel(SubscribeRecord.name) private subscribeModel: Model<SubscribeRecord>,
    @InjectModel(Race.name) private raceModel: Model<Race>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * 记录订阅授权（用户在前端授权后调用）
   */
  async recordSubscribe(userId: string, templateId: string, raceId?: string) {
    return this.subscribeModel.create({
      userId,
      templateId,
      raceId,
      status: 'pending',
    })
  }

  /**
   * 定时任务：每天 09:00 扫描需要提醒的赛事
   */
  @Cron('0 9 * * *')
  async scanAndNotify() {
    this.logger.log('开始扫描需要提醒的赛事...')
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const todayStr = today.toISOString().slice(0, 10)
    const tomorrowStr = tomorrow.toISOString().slice(0, 10)

    // 1. 报名截止提醒（明天截止）
    await this.notifyRegClose(tomorrowStr)
    // 2. 比赛提醒（明天比赛）
    await this.notifyRaceDay(tomorrowStr)
    // 3. 抽签结果提醒（今天出结果）
    await this.notifyLottery(todayStr)

    this.logger.log('扫描完成')
  }

  /** 报名截止提醒 */
  private async notifyRegClose(dateStr: string) {
    const races = await this.raceModel.find({
      registrationCloseDate: dateStr,
      status: { $in: ['待报名', '已报名'] },
    })

    const templateId = process.env.NOTIFY_TPL_REG_CLOSE || ''
    for (const race of races) {
      await this.sendSubscribeMessage(race, templateId, {
        thing1: { value: race.raceName },
        time2: { value: race.registrationCloseDate },
        thing3: { value: '报名即将截止，抓紧时间' },
      })
    }
    if (races.length > 0) this.logger.log(`报名截止提醒：${races.length} 条`)
  }

  /** 比赛日提醒 */
  private async notifyRaceDay(dateStr: string) {
    const races = await this.raceModel.find({
      raceDate: dateStr,
      status: { $in: ['已中签', '已报名', '已完成'] },
    })

    const templateId = process.env.NOTIFY_TPL_RACE_DAY || ''
    for (const race of races) {
      await this.sendSubscribeMessage(race, templateId, {
        thing1: { value: race.raceName },
        time2: { value: race.raceDate },
        thing3: { value: race.raceLocation || '祝比赛顺利' },
      })
    }
    if (races.length > 0) this.logger.log(`比赛日提醒：${races.length} 条`)
  }

  /** 抽签结果提醒 */
  private async notifyLottery(dateStr: string) {
    const races = await this.raceModel.find({
      lotteryResultDate: dateStr,
      status: '已报名',
    })

    const templateId = process.env.NOTIFY_TPL_LOTTERY || ''
    for (const race of races) {
      await this.sendSubscribeMessage(race, templateId, {
        thing1: { value: race.raceName },
        date2: { value: race.lotteryResultDate },
        thing3: { value: '抽签结果可查询' },
      })
    }
    if (races.length > 0) this.logger.log(`抽签结果提醒：${races.length} 条`)
  }

  /**
   * 发送订阅消息（调用微信 API）
   * 文档：https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/subscribe-message/subscribeMessage.send.html
   */
  private async sendSubscribeMessage(
    race: Race,
    templateId: string,
    data: Record<string, any>,
  ) {
    if (!templateId) {
      this.logger.warn(`模板 ID 未配置，跳过：race=${race._id}`)
      return
    }

    // 查找该用户有效的订阅记录
    const subscribe = await this.subscribeModel.findOneAndUpdate(
      { userId: race.userId, templateId, status: 'pending' },
      { $set: { status: 'sent', sentAt: new Date() } },
      { sort: { createdAt: -1 }, new: true },
    )

    if (!subscribe) {
      // 用户未授权订阅，跳过
      return
    }

    try {
      const user = await this.userModel.findById(race.userId)
      if (!user) return

      const accessToken = await this.getAccessToken()
      const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`

      await axios.post(url, {
        touser: user.openid,
        template_id: templateId,
        page: `pages/race/detail/detail?id=${race._id}`,
        data,
      })

      this.logger.log(`订阅消息已发送：race=${race._id}, template=${templateId}`)
    } catch (err) {
      this.logger.error(`订阅消息发送失败：race=${race._id}`, err.response?.data || err.message)
      // 发送失败，回滚状态以便重试
      await this.subscribeModel.findByIdAndUpdate(subscribe._id, { $set: { status: 'pending' } })
    }
  }

  /**
   * 获取微信 access_token（应缓存 2 小时，简化版每次调用获取）
   * 生产环境建议用 redis 缓存
   */
  private async getAccessToken(): Promise<string> {
    const appid = process.env.WX_APPID
    const secret = process.env.WX_SECRET
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`

    const { data } = await axios.get(url)
    if (data.errcode) {
      throw new Error(`获取 access_token 失败: ${data.errmsg}`)
    }
    return data.access_token
  }
}
