import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ExpenseService } from './expense.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsObject } from 'class-validator'

class UpsertExpenseDto {
  @IsString() @IsOptional() raceId?: string
  @IsString() @IsNotEmpty() raceName: string
  @IsString() @IsNotEmpty() raceDate: string
  @IsObject() @IsOptional() expenses?: any
  @IsString() @IsOptional() notes?: string
}

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll(
    @CurrentUser() userId: string,
    @Query('year') year?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.expenseService.findAll(userId, { year: year ? Number(year) : undefined, page, limit })
  }

  @Get('summary')
  getSummary(@CurrentUser() userId: string, @Query('year') year: number) {
    return this.expenseService.getSummary(userId, Number(year))
  }

  @Get('race/:raceId')
  findByRaceId(@CurrentUser() userId: string, @Param('raceId') raceId: string) {
    return this.expenseService.findByRaceId(userId, raceId)
  }

  @Post()
  upsert(@CurrentUser() userId: string, @Body() dto: UpsertExpenseDto) {
    return this.expenseService.upsert(userId, dto)
  }

  @Delete(':id')
  remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.expenseService.remove(userId, id)
  }
}
