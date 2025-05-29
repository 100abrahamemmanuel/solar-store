const express = require('express');
const { authenticateUser, authorizePermission } = require('../middlewares/authentication');
const Router = express.Router()
const {getAllUsers,getAllUsernames,getSuggestedUsers,showCurrentUser,getUserProfile,followUnFollowedUser,grantRequestsToFriendLists,friendUnFriendUser,updateUser,blockAndUnblockUser,muteAndUnmuteUser,reportUser,SuspendAndRestoreUser} = require('../controllers/userController')



Router.route('/adminRoute').post(authenticateUser, authorizePermission('founders'), getAllUsers);
Router.route('/usernames').post(authenticateUser, getAllUsernames);
Router.route('/suggested').post(authenticateUser, getSuggestedUsers);
Router.route('/showMe').post(authenticateUser, showCurrentUser);
Router.route('/profile/:username').post(authenticateUser,getUserProfile)
// Router.route('/suggested').get(authenticateUser,getSuggestedUser)
Router.route('/follow/:id').post(authenticateUser,followUnFollowedUser)
Router.route('/friend/:id').post(authenticateUser,friendUnFriendUser)
Router.route('/acceptfriendRequest/:id').post(authenticateUser,grantRequestsToFriendLists)
Router.route('/block/:id').post(authenticateUser,blockAndUnblockUser)
Router.route('/mute/:id').post(authenticateUser,muteAndUnmuteUser)
Router.route('/update').post(authenticateUser,updateUser)
Router.route('/report/:id').post(authenticateUser,reportUser)
Router.route('/suspend/:id').post(authenticateUser,SuspendAndRestoreUser)

module.exports=Router
