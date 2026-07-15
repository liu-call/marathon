import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SubscribeRecord, SubscribeRecordSchema } from './notify.schema'
import { NotifyController } from './notify.controller'
import { NotifyService } from './notify.service'
import { Race, RaceSchema } from '../race/race.schema'
import { User, UserSchema } from '../auth/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubscribeRecord.name, schema: SubscribeRecordSchema },
      { name: Race.name, schema: RaceSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [NotifyController],
  providers: [NotifyService],
  exports: [NotifyService],
})
export class NotifyModule {}
