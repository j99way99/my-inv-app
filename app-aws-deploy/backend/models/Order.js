const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  applyEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApplyEvent',
    required: true
  },
  orderItems: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'other'],
    required: true
  },
  subPaymentMethod: {
    type: String,
    enum: ['kakaopay', 'naverpay'],
    required: false
  },
  orderNumber: {
    type: String,
    unique: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Check for existing orders with the same date prefix
    let orderNumber;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      orderNumber = `ORD-${year}${month}${day}-${random}`;
      
      const existingOrder = await mongoose.model('Order').findOne({ orderNumber });
      if (!existingOrder) {
        isUnique = true;
      }
      attempts++;
    }
    
    this.orderNumber = orderNumber;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);