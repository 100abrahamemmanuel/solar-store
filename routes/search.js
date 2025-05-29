const express = require('express');
const Router = express.Router()
const { authenticateUser } = require('../middlewares/authentication');

const {advancedSearch }= require('../controllers/search')

Router.route('/').post(authenticateUser,advancedSearch)
// Router.route('/profile').get(authenticateUser)


module.exports=Router