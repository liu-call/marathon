import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { RaceModule } from './race/race.module'
import { ResultModule } from './result/result.module'
import { ExpenseModule } from './expense/expense.module'
import { ReportModule } from './report/report.module'
import { AiModule } from './ai/ai.module'
import { UploadModule } from './upload/upload.module'
import { NotifyModule } from './notify/notify.module'
import { NewsModule } from './news/news.module'
import { HealthController } from './health.controller'

@Module({
  imports: [
    // 环境变量
    ConfigModule.forRoot({ isGlobal: true }),

    // MongoDB
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/marathon'),

    // 定时任务
    ScheduleModule.forRoot(),

    // 限流：100次/分钟
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // 业务模块
    AuthModule,
    RaceModule,
    ResultModule,
    ExpenseModule,
    ReportModule,
    AiModule,
    UploadModule,
    NotifyModule,
    NewsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
