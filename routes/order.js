const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middlewares/authentication');

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require('../controllers/order');



router.route('/showAllMyOrders').post(authenticateUser, getCurrentUserOrders);

router.route('/create').post(authenticateUser, createOrder) 
router.route('/get').post(authenticateUser, getAllOrders);
router.route('/getSingle/:id').post(authenticateUser, getSingleOrder)
router.route('/Update/:id').post(authenticateUser, updateOrder);
  
  
module.exports = router;
