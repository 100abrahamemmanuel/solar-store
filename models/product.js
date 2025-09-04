const mongoose = require('mongoose');

const reviewsSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      // required: [true, 'Please provide product comment'],
    },
    date: {
      type: String,
      // required: [true, 'Please provide product date'],
    },
    reviewerName: {
      type: String,
      // required: [true, 'Please provide product reviewerName'],
    },
    reviewerEmail:{
      type: String,
      // required: [true, 'Please provide product reviewerEmail'],
    },
  }
)
const dimensionsSchema = new mongoose.Schema(
  {
    width: {
      type: String,
      default: '0',
    },
    height: {
      type: String,
      default: '0',
    },
    depth:{
      type: String,
      default: '0',
    }
  }
)
const metaSchema = new mongoose.Schema(
  {
    barcode:{
      type: String,
      // required: [true, 'Please provide product barcode'],
    },
    qrCode:{
      type: String,
      // required: [true, 'Please provide product qrCode'],
    },  
  },{timestamps:true}
)

const ProductSchema = new mongoose.Schema(
  {
   title:{
      type: String,
      required: [true, 'Please provide product title'],
    },
   description:{
      type: String,
      required: [true, 'Please provide product description'],
    },
   category:{
      type: String,
      required: [true, 'Please provide product category'],
    },
    image: [
    {
      url: { type: String, required: true },
      width: { type: Number },
      height: { type: Number },
      aspectRatio: { type: Number }
    } 
  ],
   price:{
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
   discountPercentage: {
      type: Number,
      default: 0,
    },
   rating:{
      type: Number,
      required: [true, 'Please provide product rating'],
      default: 0,
    },
   stock:{
      type: Number,
      default: 0,
    }, 
   tags:{
      type: Array,
      default: 0,
    },
   brand:{
      type: String,
    },
   sku: {
      type: String,
    },
   weight:{
      type: Number,
      default: 0,
    },
   dimensions:[dimensionsSchema],
   warrantyInformation:{
      type: String,
      required: [true, 'Please provide product warrantyInformation'],
    },
   shippingInformation: {
      type: String,
      required: [true, 'Please provide product shippingInformation'],
    },
   availabilityStatus: {
      type: String,
      required: [true, 'Please provide product availabilityStatus'],
    },
   returnPolicy:{
      type: String,
      required: [true, 'Please provide product returnPolicy'],
    },
   fullDescription:{
      type: String,
    },
   specifications:{
      type: String,
    },
   minimumOrderQuantity:{
      type: Number,
      required: [true, 'Please provide product price'],
      default: 0,
    },
   meta:[metaSchema], 
  //  thumbnail: {
  //     type: String,
  //     required: [true, 'Please provide product image'],
  //   },

  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual('reviews', {
  ref: 'Review', // This refers to the 'Review' model you should have defined
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

ProductSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ product: this._id });
});

module.exports = mongoose.model('Product', ProductSchema);