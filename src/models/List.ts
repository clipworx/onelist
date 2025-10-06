import mongoose, { Schema, model, models, Document, Types } from 'mongoose'

export interface IProduct {
  _id: Types.ObjectId
  name: string
  unit: string
  quantity: number
  status?: 'not_started' | 'partial' | 'completed'
  quantityLacking?: number
  completedBy?: Types.ObjectId
  addedBy?: Types.ObjectId
}

export interface IList extends Document {
  name: string
  products: IProduct[]
  createdBy: Types.ObjectId
  sharedWith: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: {
    type: String,
    enum: ['not_started', 'partial', 'completed'],
    default: 'not_started',
  },
  quantityLacking: { type: Number, default: 0 },
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
})

const ListSchema = new Schema<IList>(
  {
    name: { type: String, required: true },
    products: { type: [ProductSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

export const List = (models.List as mongoose.Model<IList>) || model<IList>('List', ListSchema)
