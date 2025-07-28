import mongoose, { Schema, model, models } from 'mongoose'

const productSchema = new Schema({
  name: { type: String, required: true },

  unit: {
    type: String,
    enum: [
      'pcs',     // pieces
      'pack',
      'bottle',
      'can',
      'kg',      // kilogram
      'g',       // gram
      'lb',      // pound
      'oz',      // ounce
      'liter',
      'ml',
      'dozen',
      'bag',
      'box',
      'jar',
      'tray',
    ],
    required: true,
  },

  quantity: { type: Number, required: true },

  status: {
    type: String,
    enum: ['not_started', 'partial', 'completed'],
    default: 'not_started',
  },

  quantityLacking: {
    type: Number,
    default: 0,
  },

  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
})

const listSchema = new Schema({
  name: { type: String, required: true },
  products: [productSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const List = models.List || model('List', listSchema)

