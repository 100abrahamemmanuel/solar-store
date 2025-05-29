const express = require('express');
const { authenticateUser } = require('../middlewares/authentication');
const Router = express.Router()
const {getNotifications,updateRead,deleteNotifications,deleteOneNotifications} = require('../controllers/notifications')

Router.route('/').post(authenticateUser,getNotifications)
Router.route('/updateRead').post(authenticateUser,updateRead)
Router.route('/delete').post(authenticateUser,deleteNotifications)
Router.route('/delete/:id').delete(authenticateUser,deleteOneNotifications)

module.exports=Router