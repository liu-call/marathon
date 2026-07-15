import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { RaceExpense, RaceExpenseSchema } from './expense.schema'
import { Hotel, HotelSchema } from './hotel.schema'
import { ExpenseController } from './expense.controller'
import { ExpenseService } from './expense.service'
import { HotelController } from './hotel.controller'
import { HotelService } from './hotel.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RaceExpense.name, schema: RaceExpenseSchema },
      { name: Hotel.name, schema: HotelSchema },
    ]),
  ],
  controllers: [ExpenseController, HotelController],
  providers: [ExpenseService, HotelService],
  exports: [ExpenseService, HotelService],
})
export class ExpenseModule {}
