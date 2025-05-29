const express = require('express');
const router = express.Router();
const {
  authenticateUser,
//   authorizePermissions,
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

router
  .route('/')
  .post(authenticateUser, createProduct)
  .get(getAllProducts);

// router
//   .route('/uploadImage')
//   .post(authenticateUser, uploadImage);

router
  .route('/item/:id')
  .get(getSingleProduct)
  .patch(authenticateUser, updateProduct)
  .delete(authenticateUser, deleteProduct);

router.route('/:id/reviews').get(getSingleProductReviews);
router.route('/category').get(searchProducts);

module.exports = router;
