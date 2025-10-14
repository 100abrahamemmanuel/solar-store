const Order = require('../models/order');
const Product = require('../models/product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');



const createOrder = async (req, res) => {
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
  const { items: cartItems, shippingFee, phoneNumber,name,states,address,appartment,shippingMethod,refreshToken } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if (!shippingFee) {
    throw new CustomError.BadRequestError('Please provide shipping fee');
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const product = await Product.findById(item.id);
    if (!product) {
      throw new CustomError.NotFoundError(`No product found with this id: ${item.product}`);
    }

    const singleOrderItem = {
      name: product.title,
      image: product.image[0]?.url || '', // fallback if image array is empty
      price: product.price,
      quantity: item.quantity,
      product: product._id,
    };

    orderItems.push(singleOrderItem);
    subtotal += item.quantity * product.price;
  }

  const total =shippingFee + subtotal;


  const order = await Order.create({
    user: userId,
    orderItems,
    total,
    subtotal,
    shippingFee,
    phoneNumber,
    name,
    states,
    address,
    appartment,
    shippingMethod,
    refreshToken,
    // refreshToken: paymentIntent.client_secret,
  });

  res.status(StatusCodes.CREATED).json({
    order,
  });
};

const getAllOrders = async (req, res) => {
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
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};    



const getSingleOrder = async (req, res) => {
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
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) { 
    throw new CustomError.NotFoundError(`No order with id : ${orderId}, pls check again`);
  }   
  // authorizePermission(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
}; 

const getCurrentUserOrders = async (req, res) => {
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
  const orders = await Order.find({ user: userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const updateOrder = async (req, res) => {
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
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new CustomError.NotFoundError(`No order with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = 'paid';
  await order.save();
  
  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
