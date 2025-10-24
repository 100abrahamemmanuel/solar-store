const mongoose = require('mongoose');

const SingleOrderItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
  });

const OrderSchema = mongoose.Schema(
  {
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [SingleOrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'delivered', 'canceled'],
      default: 'pending',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    states: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    appartment: {
      type: String,
      required: true,
    },
    shippingMethod: {
      type: String,
      enum: ['Delivery', 'Self-Pickup'],
    },
    // clientSecret: {
    //   type: String,
    //   required: true,
    // },
    paymentIntentId: {
      type: String,
    },
    flw_ref: {
      type: String,
    },
    tx_ref: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
