const passport = require('passport');
const User = require('../models/User');
const Token = require('../models/Token');
const { UnauthenticatedError } = require('../errors');
// const { attachResponseToCookie, creatTokenUser } = require('../utils');
const crypto = require('crypto');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
//get the info from your google developer account
passport.use(new GoogleStrategy({ 
    clientID:     process.env.GOOGLE_CLIENT_ID,   
    clientSecret:  process.env.GOOGLE_CLIENT_SECRET,
    // callbackURL: "http://localhost:7000/api/v1/auth/google/callback",
    callbackURL: "https://tweatflash.onrender.com/api/v1/auth/google/callback",
    passReqToCallback   : true
  }, 
  async function(req, accessToken, refreshToken, profile, done) {
    const emailAlreadyExists = await User.findOne({email:profile.email}).select("-password")
    let tweatstars,role,pricingPlan,pricingPlanDuration;
    if (!emailAlreadyExists) {
      if (profile.email == 'godwinaugustine' || profile.email == 'tweatflash' || profile.email == 'emmanuelabraham') { 
        tweatstars = 1000000000
        pricingPlan ="pro"
        role="founders"
        pricingPlanDuration= new Date(Date.now() + 30 * 365.25 * 24 * 60 * 60 * 1000)
      }
      else{ 
        tweatstars = 100
        pricingPlan ="basic"
        pricingPlanDuration= null
      }
      const randomUserName = crypto.randomBytes(2).toString("hex")
      const Profile =profile.displayName.replace(" ", "_")
      const userName =`${Profile}${randomUserName}`
      let dateOfBirth2=new Date('1990-01-01')
      const dateOfBirth = req.session.dateOfBirth; // Retrieve date from session
      delete req.session.dateOfBirth; // Remove from session
      const user = await User.create({ name: profile.displayName,username:userName, email:profile.email, password:profile.id,dateOfBirth:dateOfBirth2,googleId:profile.id, isVerified:profile.email_verified,tweatstars,pricingPlan,pricingPlanDuration,tweatstars}); 
      user.isVerified=true
      user.verified=Date.now()
      user.googleId=""
      done(null,user)
    }
    if (emailAlreadyExists && emailAlreadyExists.googleId){
      const user = emailAlreadyExists
      done(null,user)
    }
    if (emailAlreadyExists && !emailAlreadyExists.googleId){
      
      done( new UnauthenticatedError("An error occured, don't panic it's our fault, try using your email and password to register"),null)
    }
  }
));


passport.serializeUser((user,done)=>{  
    done(null,user)
}) 
passport.deserializeUser((user,done)=>{
    done(null,user)
})


// What you will get in profile response ?
//    provider         always set to `google`
//    id
//    name
//    displayName
//    birthday
//    relationship
//    isPerson
//    isPlusUser
//    placesLived
//    language
//    emails
//    gender
//    picture
//    coverPhoto
