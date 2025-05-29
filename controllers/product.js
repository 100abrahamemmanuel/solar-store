const Product = require('../models/product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const {  NotFoundError, BadRequestError, UnauthenticatedError } = require("../errors");

const createProduct = async (req, res) => {
  const {type}=req.body
    let userId;
    if(req.user._id){
        userId=req.user._id.toString()
    } 
    else if (req.user.userId){
        userId=req.user.userId .toString()
    }
    else{
        userId='null'   
    }
    userId=='null'? loggedIn=false: loggedIn=true
    if (loggedIn==false) {
        throw new UnauthenticatedError("User is not logged in")
    }

  const uploadedImgResponses = [];    
  if (Array.isArray(img)) { 
      for (const file of img) { 
          const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath,{ 
          use_filename: true,
          folder: 'Post-images',
          resource_type:'image',
          transformation: [
              {quality: "auto", fetch_format: 'auto'},
              {fetch_format: "auto"}
          ]
      })
      
      // uploadedImgResponses.push(uploadedResponse.secure_url); 
      // } 
      // console.log(uploadedResponse.width,uploadedResponse.height)
      uploadedImgResponses.push({
          url: uploadedResponse.secure_url,
          width: uploadedResponse.width,  // Extract width
          height: uploadedResponse.height, // Extract height,
          aspectRatio : uploadedResponse.width/uploadedResponse.height, // 527 / 1000 = 0.527

      });
  }
  } 
  else { 
      const uploadedResponse = await cloudinary.uploader.upload(img.tempFilePath,{ 
      use_filename: true,
      folder: 'Post-images',
      resource_type:'image',
      transformation: [
          {quality: "auto", fetch_format: 'auto'},
          {fetch_format: "auto"}
      ]
      })
      
      // uploadedImgResponses.push(uploadedResponse.secure_url)
      uploadedImgResponses.push({
          url: uploadedResponse.secure_url,
          width: uploadedResponse.width,  // Extract width
          height: uploadedResponse.height, // Extract height
          aspectRatio : uploadedResponse.width/uploadedResponse.height,
      });
  }
  
  const newProduct = await Product.create({
      user:userId,
      type,
      text,
      code,
      img:uploadedImgResponses,
      audio
  })
    
  await newProduct.save()
  res.status(StatusCodes.CREATED).json({ newProduct });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});

  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const searchProducts = async (req, res) => {
  const { search } = req.query;
  console.log(search)
  const product = await Product.find({ category:{ $regex: search, $options: 'i' } }).populate('reviews');

  if (!product) {
    throw new CustomError.NotFoundError(`No product in this category`);
  }

  res.status(StatusCodes.OK).json({ product }); 
};
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate('reviews');

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  const imgId = product.img.split("/").pop().split(".")[0]
  await cloudinary.uploader.destroy(imgId)

  await product.remove();
  res.status(StatusCodes.OK).json({ msg: 'Success! Product removed.' });
};

module.exports = {
  createProduct,
  getAllProducts,
  searchProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct
};
