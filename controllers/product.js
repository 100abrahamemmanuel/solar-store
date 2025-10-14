const Product = require('../models/product');
const User = require("../models/User")
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const {  NotFoundError, BadRequestError, UnauthenticatedError } = require("../errors");

const productViews = async (req, res) => {
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
 
  const user = await User.findOne({_id:userId}) 
  
  await newProduct.save()
  res.status(StatusCodes.CREATED).json({ newProduct,loggedIn });
};

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
  // console.log(img)
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
   
    
   
  // console.log(uploadedImgResponses)
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
    // thumbnail: req.body.thumbnail,
    fullDescription: req.body.fullDescription,
    specifications: req.body.specifications,
    image: uploadedImgResponses// Convert string to array 
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

  if(!product.views.includes(userId) && userId!='null' )product.views.push(userId)
                
  await product.save()
        

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

  const {title, description, category,price,discountPercentage,rating,stock,brand,sku,weight, dimensions,warrantyInformation, shippingInformation, availabilityStatus, returnPolicy, minimumOrderQuantity, meta, fullDescription, specifications}= req.body

  const user = await User.findOne({_id:userId}) 
  if(user.role!="admin") throw new BadRequestError("Unauthorized to access this route");

  const { id: productId } = req.params;

  // const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
  //   new: true,
  //   runValidators: true,
  // });
  const product = await Product.findOneAndUpdate({ _id: productId });


  product.title= title || product.title,
  product.description=description || product.description,
  product.category=category || product.category,
  product.price=Number(price) || Number(product.price),
  product.discountPercentage=Number(discountPercentage) || Number(product.discountPercentage),
  product.rating=Number(rating) || Number(product.rating),
  product.stock=Number(stock) || Number(product.stock),
  product.brand=brand || product.brand,
  product.sku=sku || product.sku,
  product.weight=Number(weight) || Number(product.weight),
  product.dimensions=dimensions || product.dimensions, 
  product.warrantyInformation=warrantyInformation || product.warrantyInformation,
  product.shippingInformation=shippingInformation || product.shippingInformation,
  product.availabilityStatus=availabilityStatus || product.availabilityStatus,
  product.returnPolicy=returnPolicy || product.returnPolicy,
  product.minimumOrderQuantity=Number(minimumOrderQuantity) || Number(product.minimumOrderQuantity),
  product.meta=meta || product.meta,
  product.fullDescription=fullDescription || product.fullDescription,
  product.specifications=specifications || product.specifications

  let product2 = await product.save()

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product2,loggedIn });
};

const deleteProduct = async (req, res) => {
  console.log("HI")
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

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.NotFoundError(`No product with id : ${productId}`);
  }
  // for (const file of product.image) { 
  //   // const imgId = file.split("/").slice(7).join("/").split(".")[0]
  //   const imgId = product.img.split("/").pop().split(".")[0]
  //   await cloudinary.uploader.destroy(imgId)
  // }
  // const imgId = product.img.split("/").pop().split(".")[0]
  // await cloudinary.uploader.destroy(imgId)

  await product.deleteOne();
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
