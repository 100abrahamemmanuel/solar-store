const {BadRequestError, UnauthenticatedError}=require('../errors')
const {StatusCodes} = require('http-status-codes')
const User = require('../models/User')
const Authuser = require("../models/Authentication")
const   Notification = require('../models/notification');
const crypto = require('crypto');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const axios = require('axios');
const client2 = require('twilio')(process.env.TWILIO_ACCONT_SID, process.env.TWILIO_AUTH_TOKEN);
let request = require('request');
const redis= require("redis")
let redisCilent;

// for email, use when you sign up to sendPulse
// const sendEmail = require('../utils/sendEmail')

const Token = require('../models/Token');
const { attachResponseToCookie,createJWToken, creatTokenUser ,SendEmail,SendInvite, isTokenValid} = require('../utils');

const register = async (req,res)=>{
    const {name,email,role,phoneNumber,password,dateOfBirth,googleId}=req.body
    let dateOfBirth2=new Date(dateOfBirth)
    if (!email && !phoneNumber) {
        throw new UnauthenticatedError("Please provide Your email or phone number")
    }
  


    const digits ="0123456789abcdefghijklmnopqrstuvwxyz"
    let verificationToken = "" 

    for (i=0;i<5;i++){
        verificationToken += digits[Math.floor(Math.random()*36)]
    }
    
    if (email) {
       
        // const verificationToken = crypto.randomBytes(40).toString('hex') 
        const emailAlreadyExists= await User.findOne({email})
        if (emailAlreadyExists) {
            throw new BadRequestError("Email already exists")
        }
        
        const authuser = await Authuser.create({
            name,
            googleId,
            email,
            password,
            role,
            dateOfBirth:dateOfBirth2,
            verificationToken,
        })
    
        var data =  {
        "api_key":process.env.SMS_API_KEY,
        "email_address" : authuser.email,
        "code": verificationToken,
        "email_configuration_id": "cc995b7b-6f9f-480c-a5bd-23c02209082c"
        };
        var options = {
            'method': 'POST',
            'url': 'https://v3.api.termii.com/api/email/otp/send',
            'headers': {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
 
        };
        request(options, function (error, response) { 
            if (error) throw new BadRequestError(error);
            let body = response.body
            return res.status(StatusCodes.OK).json({msg:body,verificationToken}) 
        });
    }
    if(phoneNumber){
        const phoneNumberAlreadyExists= await User.findOne({phoneNumber})

        if (phoneNumberAlreadyExists) {
            throw new BadRequestError("phoneNumber already exists")
            // return res.status(StatusCodes.BAD_REQUEST).json({msg:"phoneNumber already exists"}) 
        }
        else{

            const authuser = await Authuser.create({
                name,
                googleId,
                phoneNumber,
                role,
                password,
                dateOfBirth:dateOfBirth2,
                verificationToken,
            })

            var data = {
                "to": authuser.phoneNumber,
                "from": "Tweatflash",
                "sms": ` ${verificationToken}`,
                "type": "plain",
                "channel": "whatsapp_otp",
                "api_key": process.env.SMS_API_KEY,
                "time_in_minutes": "2 minutes"
            };
            var options = {
            'method': 'POST',
            'url': 'https://api.ng.termii.com/api/sms/send',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
            
            };
            request(options, function (error, response) { 
                if (error) throw new BadRequestError(error);
                let body = response.body
                return res.status(StatusCodes.OK).json({msg:body,verificationToken}) 
            });
        }
        
    }
}

const authGoogleRegistration = async (req,res)=>{
    const {email,sub}=req.body

    if (!email) {
        throw new BadRequestError("Please provide all the necessary credentials")
    }
    let googleId=sub 
    const emailAlreadyExists = await User.findOne({email}).select("-password")
    if (!emailAlreadyExists) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg:"user is not register"})
    }
    if (emailAlreadyExists && emailAlreadyExists.googleId){
        if(emailAlreadyExists.googleId== googleId){
            emailAlreadyExists.googleId=""
        
            const user = emailAlreadyExists
            const tokenUser = creatTokenUser(user)
            // create refreshToken
            let refreshToken =''
            // checking if it already exist
            const existingToken = await  Token.findOne({user: user._id})
                 
            if (existingToken) { 
                const {isValid} = existingToken
                if (!isValid) {
                    throw new UnauthenticatedError('Invalid Credentials')
                }
                refreshToken = existingToken.refreshToken
                const accessTokenJWT = createJWToken({payload:{tokenUser}})
                const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
                // console.log(tokenUser,refreshTokenJWT,accessTokenJWT)
                return res.status(StatusCodes.OK).json({  user: tokenUser,refreshTokenJWT,accessTokenJWT})
                // attachResponseToCookie({res,user: tokenUser , refreshToken})
                // return res.status(StatusCodes.OK).json({user: tokenUser})
            }
            
            refreshToken = crypto.randomBytes(40).toString('hex')
            const userAgent = req.headers['user-agent']
            const ip = req.ip
            const userToken = { refreshToken , ip , userAgent  , user: user._id}
            
    
            await Token.create(userToken)
            // attachResponseToCookie({ res, user: 'tokenUser', refreshToken })
            const accessTokenJWT = createJWToken({payload:{tokenUser}})
            const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
            
            return res.status(StatusCodes.OK).json({  user: tokenUser,refreshTokenJWT,accessTokenJWT})
        }
        else{
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Google Auth verification failed'})
        }

    }

    if (emailAlreadyExists && !emailAlreadyExists.googleId){
      
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg:"An error occured, don't panic it's not your fault, try using your email and password to register"})
    }
}

const googleRegistration = async (req,res)=>{
    const {name,email,profileImage,dateOfBirth,sub}=req.body
    
    if (!email || !name || !profileImage || !dateOfBirth || !sub ) {
        throw new BadRequestError("Please provide all the necessary credentials")
    }

    let username,tweatstars,pricingPlan,pricingPlanDuration,role ;
    let dateOfBirth2=new Date(dateOfBirth)
    let googleId=sub 
    
    const emailAlreadyExists = await User.findOne({email}).select("-password")
    
    if (!emailAlreadyExists) {
        if (email == 'godwinaugustine@gmail.com' || email == 'tweatflash@gmail.com' || email == 'emmanuelabraham@gmail.com') { 
            tweatstars = 1000000000
          pricingPlan ="pro"
          role="founders"
          pricingPlanDuration= new Date(Date.now() + 30 * 365.25 * 24 * 60 * 60 * 1000)
        }
        else{ 
          tweatstars = 50
          pricingPlan ="basic"
          role="user"
          pricingPlanDuration= null
        }
        let profile =name.toLowerCase().replace(/ /g, '_');
        const randomUserName = crypto.randomBytes(2).toString("hex")
        username =`${profile}${randomUserName}`
        
        const user = await User.create({ name,username,email:email, password:googleId,dateOfBirth:dateOfBirth2,profileImage,googleId, isVerified:true,tweatstars,pricingPlan,pricingPlanDuration,role,tweatstars});
        user.verified=Date.now()
        await user.save()
        user.googleId=""
        user.password=""

        const tokenUser = creatTokenUser(user)
        // create refreshToken
        let refreshToken =''
        // checking if it already exist
        const existingToken = await  Token.findOne({user: user._id})
        
        if (existingToken) {
            refreshToken = existingToken.refreshToken
            // attachResponseToCookie({res,user: tokenUser , refreshToken})
            // return res.status(StatusCodes.OK).json({ username: tokenUser})
            const accessTokenJWT = createJWToken({payload:{tokenUser}})
            const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
            
            return res.status(StatusCodes.OK).json({  user,refreshTokenJWT,accessTokenJWT})
        }
        
        refreshToken = crypto.randomBytes(40).toString('hex')
        const userAgent = req.headers['user-agent']
        const ip = req.ip
        const userToken = { refreshToken , ip , userAgent  , user: user._id}
        
        
        await Token.create(userToken)
        
        // attachResponseToCookie({ res, user: tokenUser, refreshToken })
        // return res.status(StatusCodes.OK).json({ username: tokenUser})
        const accessTokenJWT = createJWToken({payload:{tokenUser}})
        const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
        
        // let DEFAULT_EXPIRATION = 3600
        // redisCilent.on("connect",async ()=>{
        //     try{
        //         redisCilent.setEx(`userDetails-${user.username}`,DEFAULT_EXPIRATION,JSON.stringify(user))
        //         redisCilent.setEx(`userDetails-${user._id}`,DEFAULT_EXPIRATION,JSON.stringify(user))
        //     }catch(error){
        //         throw new BadRequestError("An error occurred")
        //     }   
        // }) 

        // await redisClient.connect()
        return res.status(StatusCodes.OK).json({  user,refreshTokenJWT,accessTokenJWT})
    }
   
    if (emailAlreadyExists && emailAlreadyExists.googleId){
        
        if(emailAlreadyExists.googleId== googleId){
            emailAlreadyExists.googleId=""
            emailAlreadyExists.password=""
        
            const user = emailAlreadyExists
            const tokenUser = creatTokenUser(user)
            // create refreshToken
            let refreshToken =''
            // checking if it already exist
            const existingToken = await  Token.findOne({user: user._id})
            
            if (existingToken) {
                refreshToken = existingToken.refreshToken
                // attachResponseToCookie({res,user: tokenUser , refreshToken})
                // return res.status(StatusCodes.OK).json({ username: tokenUser})
                const accessTokenJWT = createJWToken({payload:{tokenUser}})
                const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
                
                return res.status(StatusCodes.OK).json({  user,refreshTokenJWT,accessTokenJWT})
            }
            
            refreshToken = crypto.randomBytes(40).toString('hex')
            const userAgent = req.headers['user-agent']
            const ip = req.ip
            const userToken = { refreshToken , ip , userAgent  , user: user._id}
            

            await Token.create(userToken)

            // attachResponseToCookie({ res, user: tokenUser, refreshToken })
            // return res.status(StatusCodes.OK).json({ username: tokenUser})
            const accessTokenJWT = createJWToken({payload:{tokenUser}})
            const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
            
            return res.status(StatusCodes.OK).json({  user,refreshTokenJWT,accessTokenJWT})
        }
        else{
            return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Google Auth verification failed'})
        }

    }
    if (emailAlreadyExists && !emailAlreadyExists.googleId){
      
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg:"An error occured, don't panic it's not your fault, try using your email and password to register"})
    }
    
}


const sendVerificationEmailOrSms = async (req,res)=>{
    const {email,phoneNumber}=req.body
    if (!email&&!phoneNumber) {
        throw new BadRequestError("Please provide your email or phoneNumber") 
    }
    const digits ="0123456789abcdefghijklmnopqrstuvwxyz"
    let verificationToken = ""

    for (i=0;i<4;i++){
        verificationToken += digits[Math.floor(Math.random()*36)]
    } 


    if (email) {
        const user= await User.findOne({email})

        if(!user){
            const authuser= await Authuser.findOne({email}).select("-password")
            if(!authuser){
                throw new BadRequestError("Invalid credentials, User with this email number not found")
            }
            authuser.verificationToken=verificationToken
            await authuser.save()
            var data =  {
                "api_key":process.env.SMS_API_KEY,
                "email_address" : authuser.email,
                "code": verificationToken,
                "email_configuration_id": "cc995b7b-6f9f-480c-a5bd-23c02209082c"
            };
            var options = {
                'method': 'POST',
                'url': 'https://v3.api.termii.com/api/email/otp/send',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
                
            };
            request(options, function (error, response) { 
                if (error) throw new BadRequestError(error);
                
            });
            return res.status(StatusCodes.OK).json({msg:"code sent successfully",verificationToken}) 
        }
        
        if(user){
            if(user.isVerified === true){
                return res.status(StatusCodes.OK).json({ msg: 'Email has already been Verified' });
            }
                
            user.verificationToken=verificationToken
            await user.save()
    
            const token= user.createJWT() 
    
    
            var data =  {
                "api_key":process.env.SMS_API_KEY,
                "email_address" : user.email,
                "code": verificationToken,
                "email_configuration_id": "cc995b7b-6f9f-480c-a5bd-23c02209082c"
            };
            var options = {
                'method': 'POST',
                'url': 'https://v3.api.termii.com/api/email/otp/send',
                'headers': {
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
    
            };
            request(options, function (error, response) { 
            if (error) throw new BadRequestError(error);
            });
            return res.status(StatusCodes.OK).json({verificationToken,token}) 
        }
    }
     
    const user= await User.findOne({phoneNumber})

    if(!user){
        const authuser= await Authuser.findOne({email}).select("-password")
        if(!authuser){
            throw new BadRequestError("Invalid credentials, User with this phone number not found")
        }
        authuser.verificationToken=verificationToken
        await authuser.save()
        var data = {
            "to": authuser.phoneNumber,
            "from": "Tweatflash",
            "sms": ` ${verificationToken}`,
            "type": "plain",
            "channel": "whatsapp_otp",
            "api_key": process.env.SMS_API_KEY,
            "time_in_minutes": "2 minutes"
        };
        var options = {
            'method': 'POST',
            'url': 'https://api.ng.termii.com/api/sms/send',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        
        };
        request(options, function (error, response) { 
            if (error) throw new BadRequestError(error);
        });
        return res.status(StatusCodes.OK).json({msg:"code sent successfully",verificationToken}) 
    }
    
    if(user){
        if(user.isVerified === true){
            return res.status(StatusCodes.OK).json({ msg: 'phone number has already been Verified' });
        }
    
        user.verificationToken=verificationToken
        await user.save() 
    
        const token= user.createJWT() 
    
        var data = {
            "to": phoneNumber,
            "from": "Tweatflash",
            "sms": ` ${verificationToken}`,
            "type": "plain",
            "channel": "whatsapp_otp",
            "api_key": process.env.SMS_API_KEY,
            "time_in_minutes": "2 minutes"
        };
        var options = {
            'method': 'POST',
            'url': 'https://api.ng.termii.com/api/sms/send',
            'headers': {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        
        };
        request(options, function (error, response) { 
            if (error) throw new BadRequestError(error);
        });
        return res.status(StatusCodes.OK).json({verificationToken,token}) 
    }
}
 
const verifyEmail = async (req,res)=>{
    const {email,verificationToken}=req.body
    
    if (!email) {
        throw new BadRequestError("Please provide your email") 
    }
    // const userData =req.session.userData
    const authuser= await Authuser.findOne({email})

    if (!authuser) {
        throw new UnauthenticatedError('Invalid credentials, No user found with email')
    }
    if(authuser.isVerified){
  
        // create refreshToken
        let refreshToken =''
        // checking if it already exist
        const existingToken = await  Token.findOne({user: user._id})
        
        if (existingToken) {
            const {isValid} = existingToken
            if (!isValid) {
                throw new UnauthenticatedError('Invalid Credentials')
            }
            refreshToken = existingToken.refreshToken
            // attachResponseToCookie({res,user: tokenUser , refreshToken})
            // return res.status(StatusCodes.OK).json({user: tokenUser})
            const accessTokenJWT = createJWToken({payload:{user}})
            const refreshTokenJWT = createJWToken({payload:{user,refreshToken}})
            
            return res.status(StatusCodes.OK).json({ msg: 'Email has already been Verified', user,refreshTokenJWT,accessTokenJWT})
        }
        
        refreshToken = crypto.randomBytes(40).toString('hex')
        const userAgent = req.headers['user-agent']
        const ip = req.ip
        const userToken = { refreshToken , ip , userAgent  , user: user._id}
        

        await Token.create(userToken)

        // attachResponseToCookie({ res, user: tokenUser, refreshToken })
        
        // res.status(StatusCodes.OK).json({ user: tokenUser}) 
        const accessTokenJWT = createJWToken({payload:{user}})
        const refreshTokenJWT = createJWToken({payload:{user,refreshToken}})


        return res.status(StatusCodes.OK).json({ msg: 'Email has already been Verified',refreshTokenJWT,accessTokenJWT})
    }
    if (authuser.verificationToken !== verificationToken) { 
        throw new UnauthenticatedError(`Invalid otp code, Verification failed`)
    } 
    authuser.isVerified=true
    authuser.verified=Date.now()
    authuser.verificationToken='' 
    const user = await User.create({
        name:authuser.name,
        googleId:authuser.oogleId, 
        email:authuser.email,
        password:authuser.password, 
        role:authuser.role,  
        dateOfBirth:authuser.dateOfBirth,
        verificationToken:authuser.verificationToken 
    })
    user.isVerified=true
    user.verified=Date.now()
    user.verificationToken='' 

    await user.save()   
    await Authuser.findOneAndDelete({email})
    // create refreshToken
    let refreshToken =''
    // checking if it already exist
    const existingToken = await  Token.findOne({user: user._id})
    const tokenUser = creatTokenUser(user)
    if (existingToken) {
        const {isValid} = existingToken
        if (!isValid) {
            throw new UnauthenticatedError('Invalid Credentials')
        }
        refreshToken = existingToken.refreshToken 
        const accessTokenJWT = createJWToken({payload:{tokenUser}})
        const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
        
        return res.status(StatusCodes.OK).json({ msg: 'Email Verified', user,refreshTokenJWT,accessTokenJWT})
    }
    
    refreshToken = crypto.randomBytes(40).toString('hex')
    const userAgent = req.headers['user-agent']
    const ip = req.ip
    const userToken = { refreshToken , ip , userAgent  , user: user._id}
    

    await Token.create(userToken) 
    const accessTokenJWT = createJWToken({payload:{tokenUser}})
    const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})


    res.status(StatusCodes.OK).json({ msg: 'Email Verified',refreshTokenJWT,accessTokenJWT });
}
     
const verifyPhoneNumber = async (req,res)=>{
    // redisCilent = redis.createClient()
    console.log("hi")
    const {phoneNumber,verificationToken}=req.body
    // const verificationToken = req.params.id

    if (!phoneNumber) {
        throw new BadRequestError("Please provide your phoneNumber") 
    }
    // const userData =req.session.userData
    
    const authuser= await Authuser.findOne({phoneNumber})
    if (!authuser) {
        throw new UnauthenticatedError('Invalid credentials, No user found with phoneNumber')
    }
    if(authuser.isVerified){

        // create refreshToken
        let refreshToken =''
        // checking if it already exist
        const existingToken = await  Token.findOne({user: user._id})
        
        if (existingToken) {
            const {isValid} = existingToken
            if (!isValid) {
                throw new UnauthenticatedError('Invalid Credentials')
            }
            refreshToken = existingToken.refreshToken
            // attachResponseToCookie({res,user: tokenUser , refreshToken})
            // return res.status(StatusCodes.OK).json({user: tokenUser})
            const accessTokenJWT = createJWToken({payload:{user}})
            const refreshTokenJWT = createJWToken({payload:{user,refreshToken}})
            
            return res.status(StatusCodes.OK).json({ msg: 'Phone number has already been Verified', user,refreshTokenJWT,accessTokenJWT})
        }
        
        refreshToken = crypto.randomBytes(40).toString('hex')
        const userAgent = req.headers['user-agent']
        const ip = req.ip
        const userToken = { refreshToken , ip , userAgent  , user: user._id}
        

        await Token.create(userToken)

        // attachResponseToCookie({ res, user: tokenUser, refreshToken })
        
        // res.status(StatusCodes.OK).json({ user: tokenUser}) 
        const accessTokenJWT = createJWToken({payload:{user}})
        const refreshTokenJWT = createJWToken({payload:{user,refreshToken}})


        return res.status(StatusCodes.OK).json({ msg: 'Phone number has already been Verified', user,refreshTokenJWT,accessTokenJWT})
    }
    if (authuser.verificationToken !== verificationToken) {
        throw new UnauthenticatedError(`Invalid otp code, Verification failed`)
    } 

    authuser.isVerified=true
    authuser.verified=Date.now()
    authuser.verificationToken='' 

    const user = await User.create({
        name:authuser.name,
        username:authuser.username,
        googleId:authuser.oogleId,
        phoneNumber:authuser.phoneNumber,
        password:authuser.password,
        role:authuser.role,
        dateOfBirth:authuser.dateOfBirth,
        verificationToken:authuser.verificationToken,
        tweatcoins:authuser.tweatcoins,
        pricingPlan:authuser.pricingPlan,
        pricingPlanDuration:authuser.pricingPlanDuration
    })

    user.isVerified=true
    user.verified=Date.now()
    user.verificationToken='' 

    await user.save()
    await Authuser.findOneAndDelete({phoneNumber})
    // req.session.userData=null
    // create refreshToken
    let refreshToken =''
    // checking if it already exist
    const existingToken = await  Token.findOne({user: user._id})
    const tokenUser = creatTokenUser(user)
    if (existingToken) {
        const {isValid} = existingToken
        if (!isValid) {
            throw new UnauthenticatedError('Invalid Credentials')
        }
        refreshToken = existingToken.refreshToken
        // attachResponseToCookie({res,user: tokenUser , refreshToken})
        // return res.status(StatusCodes.OK).json({user: tokenUser})
        const accessTokenJWT = createJWToken({payload:{tokenUser}})
        const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
        
        return res.status(StatusCodes.OK).json({ msg: 'Phone number Verified', user,refreshTokenJWT,accessTokenJWT})
    }
    
    refreshToken = crypto.randomBytes(40).toString('hex')
    const userAgent = req.headers['user-agent']
    const ip = req.ip
    const userToken = { refreshToken , ip , userAgent  , user: user._id}
    

    await Token.create(userToken)

    // attachResponseToCookie({ res, user: tokenUser, refreshToken })
    
    // res.status(StatusCodes.OK).json({ user: tokenUser}) 
    const accessTokenJWT = createJWToken({payload:{tokenUser}})
    const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})

    const tweatflash = await User.findOne({username:'tweatflash'}).select("-password")
    let channel;
    if(tweatflash){
        const notification = new Notification({
            from:tweatflash._id,
            to:user._id,
            profileImage:tweatflash.profileImage,
            username:tweatflash.username,
            name:tweatflash.name,
            type:"tweatstars"
        })
    
        await notification.save()
        channel = await Channel.findOne({createdBy:tweatflash._id})
    }

    if(tweatflash && channel){
        const isFollowing = user.following.includes(channel._id)
    
        
        if (!isFollowing) {
            await Channel.findByIdAndUpdate(channel._id,{$push:{followers:user._id}})
            await User.findByIdAndUpdate(user._id,{$push:{following:channel._id}})
        }
    }

    // const Users = await User.find({ }).select('-password');

    // let DEFAULT_EXPIRATION = 8600
    // redisCilent.on("connect",async ()=>{
    //     try{
    //                redisCilent.setEx(`allUsers`,DEFAULT_EXPIRATION,JSON.stringify(Users))
            // redisCilent.setEx(`search-${user.username}`,DEFAULT_EXPIRATION,JSON.stringify(user))
    //         redisCilent.setEx(`userDetails-${user.username}`,DEFAULT_EXPIRATION,JSON.stringify(user))
    //         redisCilent.setEx(`userDetails-${user._id}`,DEFAULT_EXPIRATION,JSON.stringify(user))
    //     }catch(error){
    //         throw new BadRequestError("An error occurred")
    //     }   
    // }) 
    
    // await redisCilent.connect()

    res.status(StatusCodes.OK).json({ msg: 'phone Number Verified',user,refreshTokenJWT,accessTokenJWT });
}
 
const usePhoneOrEmailInstead = async (req,res)=>{
    // redisCilent = redis.createClient()
    const {email,phoneNumber,changeTo}=req.body
    
    if (!email&&!phoneNumber&&!changeTo) {
        throw new BadRequestError("Please provide your email or phoneNumber and what you want to change to") 
    }
    
    if(changeTo=="email"){
        const authuser= await Authuser.findOne({phoneNumber}).select("-password")
        authuser.phoneNumber=undefined
        authuser.email=email
        await authuser.save()
    
        return res.status(StatusCodes.OK).json({ msg: 'successfully changed',authuser});
    }
    const authuser= await Authuser.findOne({email}).select("-password")
    authuser.email=undefined
    authuser.phoneNumber=phoneNumber
    await authuser.save()

    res.status(StatusCodes.OK).json({ msg: 'successfully changed',authuser});
}

const login = async (req,res)=>{
    const {username,email,phoneNumber,password} = req.body 

    if(!username && !email && ! phoneNumber){
        throw new BadRequestError("Please provide the appropriate credentials")

    }
    if(!password) {
        throw new BadRequestError("Please provide your password")
    }

     
    if(email){

        const user = await User.findOne({email})

        // await Token.findOneAndDelete({ user: user._id });


        if (!user) {
            throw new UnauthenticatedError("Invalid credentials, No user found with this email")
        }

        const isPasswordCorrect = await  user.comparePassword(password)


        if (!isPasswordCorrect) {
            throw new UnauthenticatedError("Invalid credentials")
        }
        user.password=null
        if (!user.isVerified) {
            throw new UnauthenticatedError('Please verify your email')
        }

        const tokenUser = creatTokenUser(user)
        // create refreshToken
        let refreshToken =''
        // checking if it already exist
        const existingToken = await  Token.findOne({user: user._id})
             
        if (existingToken) { 
            const {isValid} = existingToken
            if (!isValid) {
                throw new UnauthenticatedError('Invalid Credentials')
            }
            refreshToken = existingToken.refreshToken
            const accessTokenJWT = createJWToken({payload:{tokenUser}})
            const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
            // console.log(tokenUser,refreshTokenJWT,accessTokenJWT)
            return res.status(StatusCodes.OK).json({  user: tokenUser,refreshTokenJWT,accessTokenJWT})
            // attachResponseToCookie({res,user: tokenUser , refreshToken})
            // return res.status(StatusCodes.OK).json({user: tokenUser})
        }
        
        refreshToken = crypto.randomBytes(40).toString('hex')
        const userAgent = req.headers['user-agent']
        const ip = req.ip
        const userToken = { refreshToken , ip , userAgent  , user: user._id}
        

        await Token.create(userToken)
        // attachResponseToCookie({ res, user: 'tokenUser', refreshToken })
        const accessTokenJWT = createJWToken({payload:{tokenUser}})
        const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
        
        return res.status(StatusCodes.OK).json({  user: tokenUser,refreshTokenJWT,accessTokenJWT})
          
    } 

    if(phoneNumber){

        const user = await User.findOne({phoneNumber})
        await Token.findOneAndDelete({ user: user._id });

        if (!user) {
            throw new UnauthenticatedError("Invalid credentials, No user found with this phoneNumber")
        }
        
        const isPasswordCorrect = await  user.comparePassword(password)

        if (!isPasswordCorrect) {
            throw new UnauthenticatedError("Invalid credentials")
        }
        user.password=null
        if (!user.isVerified) {
            throw new UnauthenticatedError('Please verify your phoneNumber')
        }

        const tokenUser = creatTokenUser(user)
        // create refreshToken
        let refreshToken =''
        // checking if it already exist
        const existingToken = await  Token.findOne({user: user._id})
        
        if (existingToken) {
            const {isValid} = existingToken
            if (!isValid) {
                throw new UnauthenticatedError('Invalid Credentials')
            }
            refreshToken = existingToken.refreshToken
            // attachResponseToCookie({res,user: tokenUser , refreshToken})
            // return res.status(StatusCodes.OK).json({user: tokenUser})
            const accessTokenJWT = createJWToken({payload:{tokenUser}})
            const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
            
            return res.status(StatusCodes.OK).json({  user: tokenUser,refreshTokenJWT,accessTokenJWT})
        }
        
        refreshToken = crypto.randomBytes(40).toString('hex')
        const userAgent = req.headers['user-agent']
        const ip = req.ip
        const userToken = { refreshToken , ip , userAgent  , user: user._id}
        

        await Token.create(userToken)

        // attachResponseToCookie({ res, user: tokenUser, refreshToken })
        
        // return res.status(StatusCodes.OK).json({ user: tokenUser})
        const accessTokenJWT = createJWToken({payload:{tokenUser}})
        const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
        
        return res.status(StatusCodes.OK).json({  user: tokenUser,refreshTokenJWT,accessTokenJWT})
    }

    const user = await User.findOne({username}).select("-password")

    await Token.findOneAndDelete({ user: user._id });


    if (!user) {
        throw new UnauthenticatedError("Invalid credentials, No user found with this username")
    }
    
    
    const isPasswordCorrect = await  user.comparePassword(password)

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Invalid credentials")
    }
    user.password=null
    if (!user.isVerified) {
        throw new UnauthenticatedError('Please verify your email')
    }
    
    // this token is just for us to send prorper details as our response especially since we are sending it to our user's dashboard and handle logging out so the user can logout with out having to delete his/her accounts with you

    const tokenUser = creatTokenUser(user)
    // create refreshToken
    let refreshToken =''
    // checking if it already exist
    const existingToken = await  Token.findOne({user: user._id})
    
    if (existingToken) {
        const {isValid} = existingToken
        if (!isValid) {
            throw new UnauthenticatedError('Invalid Credentials')
        }
        refreshToken = existingToken.refreshToken
        // attachResponseToCookie({res,user: tokenUser , refreshToken})
        // return res.status(StatusCodes.OK).json({user: tokenUser})
        const accessTokenJWT = createJWToken({payload:{tokenUser}})
        const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
        
        return res.status(StatusCodes.OK).json({  user,refreshTokenJWT,accessTokenJWT})
    }
    
    refreshToken = crypto.randomBytes(40).toString('hex')
    const userAgent = req.headers['user-agent']
    const ip = req.ip
    const userToken = { refreshToken , ip , userAgent  , user: user._id}
    

    await Token.create(userToken)

    // attachResponseToCookie({ res, user: tokenUser, refreshToken })
    
    // res.status(StatusCodes.OK).json({ user: tokenUser}) 
    const accessTokenJWT = createJWToken({payload:{tokenUser}})
    const refreshTokenJWT = createJWToken({payload:{tokenUser,refreshToken}})
    
    return res.status(StatusCodes.OK).json({  user,refreshTokenJWT,accessTokenJWT})
}

const logout = async (req,res)=>{
    
    await Token.findOneAndDelete({ user: req.user.userId });

    // res.cookie('accessToken','logout',{
    //     htppOnly:true,
    //     expires: new Date(Date.now())
    // })

    // res.cookie('refreshToken','logout',{
    //     htppOnly:true,
    //     expires: new Date(Date.now())
    // })

    res.status(StatusCodes.OK).json({msg: 'user logged out!'})
}

const forgotPassword = async (req,res)=>{
    const {email,phoneNumber} = req.body

    if(!email && !phoneNumber){
        throw new BadRequestError("Pleasse provide the appropriate credentials")
    }

    if(phoneNumber){
        const user = await User.findOne({phoneNumber})
        if (!user) {
            throw new UnauthenticatedError("Invalid credentials, No user found with this phoneNumber")
        }

        
        const resetToken = user.getResetPasswordToken()

        // message we will send
        const message = `<h1>You have requested a password reset</h1>
        <p>${resetToken} </p>`
        

        await user.save()

        var data = {
            "to": phoneNumber,
            "from": "Tweatflash",
            "sms": ` ${verificationToken}`,
            "type": "plain",
            "channel": "whatsapp_otp",
            "api_key": process.env.SMS_API_KEY,
            "time_in_minutes": "2 minutes"
        };
        var options = {
        'method': 'POST',
        'url': 'https://api.ng.termii.com/api/sms/send',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
        
        };
        request(options, function (error, response) { 
            if (error) throw new BadRequestError(error);
            let body = response.body
            res.status(StatusCodes.OK).json({msg:body,verificationToken,token}) 
        });
    }

    const user = await User.findOne({email}).select("-password")

    if (!user) {
        throw new UnauthenticatedError("Invalid credentials, No user found with this email")
    }

    
    const resetToken = user.getResetPasswordToken()


    // message we will send
    const message = `<h1>You have requested a password reset</h1>
    <p>${resetToken} </p>`
    // email subject
    const emailSubject = 'Password reset Request'
    await user.save()

    //when you set up sendpulse account 

    var data =  {
        "api_key":process.env.SMS_API_KEY,
        "email_address" : user.email,
        "code": resetToken,
        "email_configuration_id": "cc995b7b-6f9f-480c-a5bd-23c02209082c"
    };
    var options = {
        'method': 'POST',
        'url': 'https://v3.api.termii.com/api/email/otp/send',
        'headers': {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)

    };
    request(options, function (error, response) { 
    if (error) throw new BadRequestError(error);
        let body = response.body
        res.status(StatusCodes.OK).json({body,subject:emailSubject, msg:message}) 
    });
}

const resetPassword = async (req,res)=>{
    const { resetToken,password } = req.body;
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}// makeing sure the token is still valid or greater than the date now
    })

    if (!user) {
        throw new UnauthenticatedError("invalid reset token")
    }

    user.password=password
    user.resetPasswordToken=undefined
    user.resetPasswordExpire=undefined

    await user.save()

    res.status(StatusCodes.OK).json({ success:true,data:'Password reset success'})
}

const userAuth = async (req,res)=>{
   const signedCookies = JSON.parse(req.body.signedCookies); 
  const { refreshToken} = signedCookies; 
    if (!refreshToken) { 
        throw new UnauthenticatedError('Kindly send the refresh token')
    }
    const payload = isTokenValid( refreshToken);

    if (!payload) { 
        throw new UnauthenticatedError('User is not logged in')
    }
    const userId = payload.payload.tokenUser._id;
   

    const user = await User.findOne({_id:userId}).select("-password")
    


    const notifications = await Notification.find({to:userId})
    res.status(StatusCodes.OK).json({user,notificationsCount:notifications.length})

}   

const emailAndphoneNumberAuth = async (req,res)=>{
   
    const {email,phoneNumber}=req.body
    
    
    if (!email && !phoneNumber) {
        throw new BadRequestError("Please provide Your email or phone number")
    }
    
   
    if (email) {
        const emailAlreadyExists= await User.findOne({email})

        if (emailAlreadyExists) {
            throw new BadRequestError("Email already exists")
        }
        res.status(StatusCodes.OK).json({msg:"No user with this email"})

    }    
    
    const phoneNumberAlreadyExists= await User.findOne({phoneNumber})

    if (phoneNumberAlreadyExists) {
        throw new BadRequestError("phoneNumber already exists")
    }

    res.status(StatusCodes.OK).json({msg:"No user with this phoneNumber"})

    
} 
const usernameAuth = async (req,res)=>{
   
    const {username}=req.body
    
    if (!username) {
        throw new BadRequestError("Please provide Your Username")
    }
    
   
    const usernameAlreadyExists= await User.findOne({username})

    if (usernameAlreadyExists) {
        throw new BadRequestError("Username already exists")
    }
    res.status(StatusCodes.OK).json({msg:"No user with this username"})

    
} 



module.exports={ 
    register,
    authGoogleRegistration,
    googleRegistration,
    verifyEmail,
    sendVerificationEmailOrSms,
    verifyPhoneNumber,
    usePhoneOrEmailInstead,
    login,
    logout,
    forgotPassword,
    resetPassword ,
    userAuth,
    usernameAuth,
    emailAndphoneNumberAuth
}

