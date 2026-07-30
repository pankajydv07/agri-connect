const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: [true, 'Please add a crop name'],
      trim: true,
      maxlength: [120, 'Crop name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Please add quantity available'],
      // Without this, the old non-atomic order flow could drive stock negative.
      min: [0, 'Quantity cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Please specify the unit'],
      enum: ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      default: null,
    },
    availableUntil: {
      type: Date,
      required: [true, 'Please add availability date'],
    },
    status: {
      type: String,
      enum: ['Available', 'Out of Stock', 'Coming Soon'],
      default: 'Available',
    },
    farmer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// The marketplace filters by status and sorts by recency; the farmer dashboard
// queries by owner. None of these were indexed, so every listing page scanned
// the whole collection.
ProductSchema.index({ farmer: 1, createdAt: -1 });
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ cropName: 'text', description: 'text' });

/**
 * Cascade cleanup.
 *
 * The original hook was `pre('remove')`, which only fires on
 * `document.remove()` — but the controller deletes via `findByIdAndDelete`, so
 * the cascade never ran and orphaned orders accumulated silently. Query
 * middleware fires on the calls we actually make.
 */
async function cascadeDeleteOrders(doc) {
  if (!doc) return;
  await mongoose.model('Order').deleteMany({ product: doc._id });
}

ProductSchema.post('findOneAndDelete', cascadeDeleteOrders);
ProductSchema.post('deleteOne', { document: true, query: false }, async function cascade() {
  await cascadeDeleteOrders(this);
});

ProductSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

module.exports = mongoose.model('Product', ProductSchema);
