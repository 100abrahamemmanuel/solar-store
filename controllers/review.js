const Review = require('../models/review');
const Product = require('../models/product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions2 } = require('../utils');

const createReview = async (req, res) => {
      let userId;
  if(req.user ){
      userId=req.user._id.toString()
  } 
  else if (req.user ){
      userId=req.user.userId .toString()
  }
  else{
      userId='null'    
  }
  userId=='null'? loggedIn=false: loggedIn=true
  const { id: productId } = req.params;
  const isValidProduct = await Product.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
 
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      'Already submitted review for this product'
    );
  }
  const review = await Review.create({
    product: productId,
    user: userId,
    comment:req.body.comment,
    rating:req.body.rating
  });
  res.status(StatusCodes.CREATED).json({ review });
};
const getAllReviews = async (req, res) => {
   let userId;
  if(req.user ){
      userId=req.user._id.toString()
  } 
  else if (req.user ){
      userId=req.user.userId .toString()
  }
  else{
      userId='null'    
  }
  userId=='null'? loggedIn=false: loggedIn=true

  const reviews = await Review.find({}).populate({
    path: 'product',
    select: 'name company price',
  });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
   let userId;
  if(req.user ){
      userId=req.user._id.toString()
  } 
  else if (req.user ){
      userId=req.user.userId .toString()
  }
  else{
      userId='null'    
  }
  userId=='null'? loggedIn=false: loggedIn=true

  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
   let userId;
  if(req.user ){
      userId=req.user._id.toString()
  } 
  else if (req.user ){
      userId=req.user.userId .toString()
  }
  else{
      userId='null'    
  }
  userId=='null'? loggedIn=false: loggedIn=true

  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  checkPermissions2(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
   let userId;
  if(req.user ){
      userId=req.user._id.toString()
  } 
  else if (req.user ){
      userId=req.user.userId .toString()
  }
  else{
      userId='null'    
  }
  userId=='null'? loggedIn=false: loggedIn=true

  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new CustomError.NotFoundError(`No review with id ${reviewId}`);
  }

  checkPermissions2(req.user, review.user);
  await review.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! Review removed' });
};

const getSingleProductReviews = async (req, res) => {
   let userId;
  if(req.user ){
      userId=req.user._id.toString()
  } 
  else if (req.user ){
      userId=req.user.userId .toString()
  }
  else{
      userId='null'    
  }
  userId=='null'? loggedIn=false: loggedIn=true
  
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
