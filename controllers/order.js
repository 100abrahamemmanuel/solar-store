const Order = require('../models/order');
const Product = require('../models/product');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');



const createOrder = async (req, res) => {
  const { items: cartItems, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if (!shippingFee) {
    throw new CustomError.BadRequestError('Please provide shipping fee');
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const product = await Product.findById(item);
    if (!product) {
      throw new CustomError.NotFoundError(`No product found with this id: ${item.product}`);
    }

    const singleOrderItem = {
      name: product.title,
      image: product.image[0]?.url || '', // fallback if image array is empty
      price: product.price,
      amount: item.amount,
      product: product._id,
    };

    orderItems.push(singleOrderItem);
    subtotal += item.amount * product.price;
  }

  const total =shippingFee + subtotal;



  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    shippingFee,
    refreshToken: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res.status(StatusCodes.CREATED).json({
    order,
  });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};    



const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) { 
    throw new CustomError.NotFoundError(`No order with id : ${orderId}, pls check again`);
  }   
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const updateOrder = async (req, res) => {
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
