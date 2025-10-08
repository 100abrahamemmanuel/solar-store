const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middlewares/authentication');

const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
} = require('../controllers/review');

router.route('/create/:id').post(authenticateUser, createReview).get(getAllReviews);

router.route('/getSingleReview/:id').post(getSingleReview)
router.route('/update/:id').post(authenticateUser, updateReview)
router.route('/delete/:id').post(authenticateUser, deleteReview);

module.exports = router;
 