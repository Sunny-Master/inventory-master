import mongoose from "mongoose"

const Schema = mongoose.Schema

const itemSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    default: 'generic'
  },
  quantity: {
    type: Number,
    min: 0,
    default: 0,
  },
  unit: {
    type: String,
    enum: ['lb(s)', 'ltr(s)', 'count(s)'],
    default: 'count(s)'
  },
  utility: {
    type: Number,
    min: 1,
    max: 10,
    default: 3,
  }
}, {
  timestamps: true
})

const inventorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  items: [itemSchema],
  owner: {type: Schema.Types.ObjectId, ref: 'User'},
  managers: [{type: Schema.Types.ObjectId, ref: 'User'}]
}, {
  timestamps: true
})

const Inventory = mongoose.model('Inventory', inventorySchema)

export {
  Inventory
}