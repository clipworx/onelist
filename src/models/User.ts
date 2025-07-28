// models/User.ts

import { Schema, model, models, Document, Model } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

// ✅ Declare the model with proper typing
const User: Model<IUser> = models.User || model<IUser>('User', userSchema)

export default User
