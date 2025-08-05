import mongoose, { InferSchemaType, Schema, model, models } from 'mongoose'

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
  completedBy: {
    type: String,
    default: null
  },
  addedBy: {
    type: String,
  },
})

const listSchema = new Schema({
  name: { type: String, required: true },
  products: { type: [productSchema], default: [] },
  createdBy: {
    type: String,
  },
  sharedWith: {
    type: [String],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

type ListType = InferSchemaType<typeof listSchema>
const List = models.List || model<ListType>('List', listSchema)
export { List }
