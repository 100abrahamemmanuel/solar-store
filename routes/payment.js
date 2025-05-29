const express = require('express');
const Router = express.Router()
const { authenticateUser } = require('../middlewares/authentication');
const {purchaseTweatcoins,giftTweatcoins} = require('../controllers/tweatcoins');

Router.route('/tweatstars/buy').post(authenticateUser,purchaseTweatcoins)
Router.route('/tweatstars/send').post(authenticateUser,giftTweatcoins)

module.exports=Router