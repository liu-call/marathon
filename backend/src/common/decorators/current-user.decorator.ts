import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * 从 JWT 中提取当前用户 ID
 * 用法：@CurrentUser() userId: string
 */
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user
    return data ? user?.[data] : user?.userId
  },
)
