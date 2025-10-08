const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermission,
} = require('../middlewares/authentication');

const {
  createProduct,
  getAllProducts,
  searchProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
//   uploadImage,
} = require('../controllers/product');

const { getSingleProductReviews } = require('../controllers/review');

router.route('/create').post( authenticateUser, createProduct)
router.route('/all').post(getAllProducts);

 

router.route('/getItem/:id').post(getSingleProduct)
router.route('/updateItem/:id').post(authenticateUser, updateProduct)
router.route('/deleteItem/:id').post(authenticateUser, deleteProduct);

router.route('/:id/reviews').post(getSingleProductReviews);
router.route('/category').post(searchProducts);

module.exports = router;
