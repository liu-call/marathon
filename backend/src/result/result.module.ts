import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Result, ResultSchema } from './result.schema'
import { ResultController } from './result.controller'
import { ResultService } from './result.service'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
    AiModule,
  ],
  controllers: [ResultController],
  providers: [ResultService],
  exports: [ResultService],
})
export class ResultModule {}
