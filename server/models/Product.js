const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: [true, 'Please add a crop name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  quantity: {
    type: Number,
    required: [true, 'Please add quantity available']
  },
  unit: {
    type: String,
    required: [true, 'Please specify the unit (kg, ton, etc.)']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  availableUntil: {
    type: Date,
    required: [true, 'Please add availability date']
  },
  farmer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete orders when a product is deleted
ProductSchema.pre('remove', async function(next) {
  await this.model('Order').deleteMany({ product: this._id });
  next();
});

// Reverse populate with orders
ProductSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

module.exports = mongoose.model('Product', ProductSchema);
