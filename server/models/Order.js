const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  quantityOrdered: {
    type: Number,
    required: [true, 'Please add quantity ordered']
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryAddress: {
    type: String,
    required: [true, 'Please add a delivery address']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
