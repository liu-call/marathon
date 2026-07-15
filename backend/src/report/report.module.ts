import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AnnualReport, AnnualReportSchema } from './report.schema'
import { ReportController } from './report.controller'
import { ReportService } from './report.service'
import { Result, ResultSchema } from '../result/result.schema'
import { RaceExpense, RaceExpenseSchema } from '../expense/expense.schema'
import { Race, RaceSchema } from '../race/race.schema'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnnualReport.name, schema: AnnualReportSchema },
      { name: Result.name, schema: ResultSchema },
      { name: RaceExpense.name, schema: RaceExpenseSchema },
      { name: Race.name, schema: RaceSchema },
    ]),
    AiModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
