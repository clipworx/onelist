import mongoose, { InferSchemaType, Schema, model, models } from 'mongoose'
import { User } from '@/models/User'

const productSchema = new Schema({
  name: { type: String, required: true },
  unit: {
    type: String,
    enum: [
      'pcs', 'pack', 'bottle', 'can', 'kg', 'g', 'lb', 'oz', 'liter', 'ml',
      'dozen', 'bag', 'box', 'jar', 'tray',
    ],
    required: true,
  },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['not_started', 'partial', 'completed'],
    default: 'not_started',
  },
  quantityLacking: { type: Number, default: 0 },
  completedBy: { type: Schema.Types.ObjectId, ref: User },
  addedBy:{ type: Schema.Types.ObjectId, ref: User },
})

const listSchema = new Schema({
  name: { type: String, required: true },
  products: { type: [productSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: User }, // must have ref
  sharedWith: [{ type: Schema.Types.ObjectId, ref: User }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

type ListType = InferSchemaType<typeof listSchema>
const List = models.List || model<ListType>('List', listSchema)
export { List }
