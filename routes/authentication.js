const express = require('express');
const router = express.Router()
const {authenticateUser} = require('../middlewares/authentication')
const {userAuth,emailAndphoneNumberAuth,usernameAuth,register,registerWithGoogle,authGoogleRegistration,googleRegistration,googleCallback,googleRegistrationSuccessful,googleRegistrationFailed,loginWithGoogle,verifyEmail,verifyPhoneNumber,usePhoneOrEmailInstead,verifyEmailFrontend,login,logout,forgotPassword,resetPassword,resetPasswordFrontend,sendInvitationEmail,sendVerificationEmailOrSms,registerThroughInviteFrontend,registerThroughInvite} = require('../controllers/authentication');



  
router.route('/').post(userAuth)
router.route('/emailAndphoneNumberAuth').post(emailAndphoneNumberAuth)
router.route('/usernameAuth').post(usernameAuth)
router.route('/register').post(register)
router.route('/google').post(googleRegistration)    
router.route('/authGoogle').post(authGoogleRegistration)
router.route('/verifyEmail').post(verifyEmail)
router.route('/verifyPhoneNumber').post(verifyPhoneNumber)
router.route('/switchOtpProcess').post(usePhoneOrEmailInstead)
router.route('/login').post(login) 
router.route('/logout').delete(authenticateUser,logout) 
router.route('/forgotPassword').post(forgotPassword) 
router.route('/resetPassword').post(resetPassword)
router.route('/verificationToken').post(sendVerificationEmailOrSms)



module.exports=router
 
