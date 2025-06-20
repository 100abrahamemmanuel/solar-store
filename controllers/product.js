const Product = require('../models/product');
const User = require("../models/User")
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const {  NotFoundError, BadRequestError, UnauthenticatedError } = require("../errors");

const createProduct = async (req, res) => {
  // const {type}=req.body
  // console.log(req.user._id)
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
  // if (loggedIn==false) {
  //     throw new UnauthenticatedError("User is not logged in")
  // }
  // console.log(req.body)
  const user = await User.findOne({_id:userId}) 
  if(user.role!="admin") throw new BadRequestError("Unauthorized to access this route");
  let img;
  req.files && req.files.image? img=req.files.image:null  
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
       
      uploadedImgResponses.push({
          url: uploadedResponse.secure_url,
          width: uploadedResponse.width,  // Extract width
          height: uploadedResponse.height, // Extract height,
          aspectRatio : uploadedResponse.width/uploadedResponse.height, // 527 / 1000 = 0.527

      });
  }
  } else { 
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
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    price: Number(req.body.price),
    discountPercentage: Number(req.body.discountPercentage),
    rating: Number(req.body.rating),
    stock: Number(req.body.stock),
    brand: req.body.brand,
    sku: req.body.sku,
    weight: Number(req.body.weight),
    dimensions: JSON.parse(req.body.dimensions), // Convert string to object
    warrantyInformation: req.body.warrantyInformation,
    shippingInformation: req.body.shippingInformation,
    availabilityStatus: req.body.availabilityStatus,
    reviews: JSON.parse(req.body.reviews), // Convert string to array of objects
    returnPolicy: req.body.returnPolicy,
    minimumOrderQuantity: Number(req.body.minimumOrderQuantity),
    meta: JSON.parse(req.body.meta), // Convert string to object
    thumbnail: req.body.thumbnail,
    images: JSON.parse(req.body.images), // Convert string to array 
  });

  await newProduct.save()
  res.status(StatusCodes.CREATED).json({ newProduct,loggedIn });
};

const getAllProducts = async (req, res) => {
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
  const products = await Product.find({}).sort({ rating: -1 });  


  res.status(StatusCodes.OK).json({ products, count: products.length,loggedIn });
};

const searchProducts = async (req, res) => {
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
  const { search } = req.query;
  const product = await Product.find({ 
    $or: [
      { title: { $regex: search, $options: 'i' } }, // Search by title
      { category: { $regex: search, $options: 'i' } }, // Search by category
      { description: { $regex: search, $options: 'i' } } // Search by description
    ]
  }).populate('reviews');

  if (!product) {
    throw new CustomError.NotFoundError(`No product in this category`);
  }

  res.status(StatusCodes.OK).json({ product,loggedIn }); 
};

const getSingleProduct = async (req, res) => {
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
  const product = await Product.findOne({ _id: productId }).populate('reviews');

  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product,loggedIn });
};
const updateProduct = async (req, res) => {
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
  const user = await User.findOne({_id:userId}) 
  if(user.role!="admin") throw new BadRequestError("Unauthorized to access this route");

  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product,loggedIn });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }
  for (const file of post.img) { 
    // const imgId = file.split("/").slice(7).join("/").split(".")[0]
    const imgId = product.img.split("/").pop().split(".")[0]
    await cloudinary.uploader.destroy(imgId)
  }
  // const imgId = product.img.split("/").pop().split(".")[0]
  // await cloudinary.uploader.destroy(imgId)

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
