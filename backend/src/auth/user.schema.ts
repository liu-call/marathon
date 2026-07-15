import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, index: true })
  openid: string

  @Prop()
  unionid: string

  @Prop()
  nickName: string

  @Prop()
  avatarUrl: string

  @Prop({ default: 'user' })
  role: string // user | admin

  @Prop()
  gender: number

  @Prop()
  city: string

  @Prop({ default: true })
  isActive: boolean

  @Prop()
  sessionKey: string

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
