import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { HotelService } from './hotel.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator'

class CreateHotelDto {
  @IsString() @IsNotEmpty() raceId: string
  @IsString() @IsOptional() raceName?: string
  @IsString() @IsNotEmpty() hotelName: string
  @IsString() @IsOptional() checkInDate?: string
  @IsString() @IsOptional() checkOutDate?: string
  @IsNumber() @IsOptional() nights?: number
  @IsNumber() @IsOptional() price?: number
  @IsNumber() @IsOptional() totalPrice?: number
  @IsString() @IsOptional() distanceToStart?: string
  @IsString() @IsOptional() address?: string
  @IsString() @IsOptional() bookingPlatform?: string
  @IsString() @IsOptional() bookingUrl?: string
  @IsString() @IsOptional() status?: string
  @IsString() @IsOptional() notes?: string
}

@Controller('hotels')
@UseGuards(JwtAuthGuard)
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get()
  findAll(
    @CurrentUser() userId: string,
    @Query('year') year?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.hotelService.findAll(userId, { year, page, limit })
  }

  @Get('race/:raceId')
  findByRaceId(@CurrentUser() userId: string, @Param('raceId') raceId: string) {
    return this.hotelService.findByRaceId(userId, raceId)
  }

  @Get(':id')
  findOne(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.hotelService.findOne(userId, id)
  }

  @Post()
  create(@CurrentUser() userId: string, @Body() dto: CreateHotelDto) {
    return this.hotelService.create(userId, dto)
  }

  @Put(':id')
  update(@CurrentUser() userId: string, @Param('id') id: string, @Body() dto: Partial<CreateHotelDto>) {
    return this.hotelService.update(userId, id, dto)
  }

  @Delete(':id')
  remove(@CurrentUser() userId: string, @Param('id') id: string) {
    return this.hotelService.remove(userId, id)
  }
}
