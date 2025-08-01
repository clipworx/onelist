import { Schema, model, models, Document, Model } from 'mongoose'

export interface IUser extends Document {
  nickname: string
  email: string
  password: string
}

const userSchema = new Schema<IUser>({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

export const User: Model<IUser> = models.User || model<IUser>('User', userSchema)

