const mongoose = require('mongoose');

const ORDER_STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];

const OrderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    farmer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    quantityOrdered: {
      type: Number,
      required: [true, 'Please add quantity ordered'],
      min: [0, 'Quantity ordered cannot be negative'],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    /** Snapshot of the price at purchase time, so later edits can't rewrite history. */
    unitPriceAtOrder: {
      type: Number,
      min: [0, 'Unit price cannot be negative'],
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Pending',
    },
    deliveryAddress: {
      type: String,
      required: [true, 'Please add a delivery address'],
      trim: true,
      maxlength: [500, 'Delivery address cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
);

// Every dashboard query filters by buyer or farmer and sorts by recency. None
// of these fields were indexed.
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ farmer: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ product: 1 });

module.exports = mongoose.model('Order', OrderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
