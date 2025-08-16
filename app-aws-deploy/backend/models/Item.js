const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemNumber: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  stockQuantity: {
    type: Number,
    required: true,
    default: 0
  },
  price: {
    type: Number,
    required: true
  },
  salesQuantity: {
    type: Number,
    default: 0  // This will be calculated dynamically from orders
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', itemSchema);