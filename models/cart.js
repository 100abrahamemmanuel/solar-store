const mongoose = require('mongoose');


const CartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true,
    },
    number:{
        type:Number,
        required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', CartSchema);
 