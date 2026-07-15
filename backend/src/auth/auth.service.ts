import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import axios from 'axios'
import { User } from './user.schema'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * 微信小程序登录
   * 1. 用 code 换取 openid + session_key
   * 2. 查找或创建用户
   * 3. 签发 JWT
   */
  async loginByCode(code: string) {
    // 1. 用 code 换取 openid
    const { openid, session_key } = await this.code2Session(code)

    // 2. 查找或创建用户
    let user = await this.userModel.findOne({ openid })
    if (!user) {
      user = await this.userModel.create({ openid, sessionKey: session_key })
    } else {
      user.sessionKey = session_key
      await user.save()
    }

    // 3. 签发 JWT
    const payload = { userId: user._id.toString(), openid: user.openid, role: user.role }
    const token = this.jwtService.sign(payload)

    return {
      token,
      userInfo: {
        id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    }
  }

  /**
   * 更新用户信息（昵称、头像等）
   */
  async updateUserInfo(userId: string, data: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true },
    )
    if (!user) throw new UnauthorizedException('用户不存在')
    return {
      id: user._id,
      nickName: user.nickName,
      avatarUrl: user.avatarUrl,
      role: user.role,
    }
  }

  /**
   * 刷新 Token
   */
  async refreshToken(userId: string) {
    const user = await this.userModel.findById(userId)
    if (!user) throw new UnauthorizedException('用户不存在')
    const payload = { userId: user._id.toString(), openid: user.openid, role: user.role }
    return { token: this.jwtService.sign(payload) }
  }

  /**
   * 微信 code 换取 openid + session_key
   */
  private async code2Session(code: string) {
    const appid = process.env.WX_APPID
    const secret = process.env.WX_SECRET
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`

    const { data } = await axios.get(url)
    if (data.errcode) {
      throw new UnauthorizedException(`微信登录失败: ${data.errmsg}`)
    }
    return { openid: data.openid, session_key: data.session_key }
  }
}
