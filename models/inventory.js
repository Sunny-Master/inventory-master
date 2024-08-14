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

const suggestionSchema = new Schema({
  item: itemSchema,
  type: {
    type: String,
    enum: ['Add', 'Remove'],
  },
  comment: String,
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
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
  managers: [{type: Schema.Types.ObjectId, ref: 'User'}],
  privateView: Boolean,
  suggestions: [suggestionSchema]
}, {
  timestamps: true
})

const Inventory = mongoose.model('Inventory', inventorySchema)

export {
  Inventory
}