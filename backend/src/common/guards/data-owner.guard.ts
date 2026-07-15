import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Race } from '../../race/race.schema'

/**
 * 数据所有权守卫：确保用户只能操作自己的赛事数据
 * 用法：@UseGuards(JwtAuthGuard, DataOwnerGuard)
 */
@Injectable()
export class DataOwnerGuard implements CanActivate {
  constructor(@InjectModel(Race.name) private raceModel: Model<Race>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const userId = request.user?.userId
    const resourceId = request.params.id

    if (!userId || !resourceId) {
      return true // 没有 resourceId 时跳过检查（列表请求）
    }

    const resource = await this.raceModel.findById(resourceId)
    if (!resource) {
      throw new ForbiddenException('资源不存在')
    }

    if (resource.userId !== userId) {
      throw new ForbiddenException('无权操作此资源')
    }

    return true
  }
}
