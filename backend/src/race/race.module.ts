import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Race, RaceSchema } from './race.schema'
import { RaceController } from './race.controller'
import { RaceService } from './race.service'
import { RaceImportService } from './race-import.service'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Race.name, schema: RaceSchema }]),
    AiModule,
  ],
  controllers: [RaceController],
  providers: [RaceService, RaceImportService],
  exports: [RaceService],
})
export class RaceModule {}
