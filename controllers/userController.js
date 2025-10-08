const cloudinary = require('cloudinary').v2;
const { StatusCodes } = require("http-status-codes")
const User = require("../models/User")
const {  NotFoundError, BadRequestError, UnauthenticatedError } = require("../errors");
const Post = require('../models/post');
const Message = require('../models/messages')
const conversation = require('../models/conversation');
const Notification = require("../models/notification")
const { gettingSuggestedUsersFullStructuredAlgorithm } = require('../utils/algorithmStructures');
var request = require('request');


const getAllUsers = async (req, res) => {
    
    // redisCilent = redis.createClient({
    //     url: 'redis://redis:6379'
    // })
    
    const Users = await User.find({ }).select('-password');

    // redisCilent.setEx(`allUsers`,DEFAULT_EXPIRATION,JSON.stringify(Users))
    
    
    res.status(StatusCodes.OK).json({ users:Users});

     
    // redisCilent.on("connect",async ()=>{
    //     try{
    //         let DEFAULT_EXPIRATION=300
    //         const cachedData = await redisCilent.get(`allUsers`)
    //         if(cachedData!=null){
    //             let cachedUsers =JSON.parse(cachedData)

    //             return res.status(StatusCodes.OK).json({users:cachedUsers})
    //         }
    //         else{

    //             const Users = await User.find({ }).select('-password');

    //             redisCilent.setEx(`allUsers`,DEFAULT_EXPIRATION,JSON.stringify(Users))
                
                
    //             res.status(StatusCodes.OK).json({ users:Users});

    //         }
    //     }catch(error){
    //         throw new BadRequestError("An error occurred")
    //     }   
    // }) 

    // await redisCilent.connect()

};

const getAllUsernames = async (req, res) => {
    // redisCilent = redis.createClient({
    //     url: 'redis://redis:6379'
    // })
    const userDetails= req.user

    if (!userDetails) {
        throw new UnauthenticatedError("User is not logged in")
    }
     
    const userNames = await User.find({ }).select('username');

    redisCilent.setEx(`allUsernames`,DEFAULT_EXPIRATION,JSON.stringify(userNames))
    
    
    res.status(StatusCodes.OK).json({ users:userNames});


    // redisCilent.on("connect",async ()=>{
    //     try{
    //         let DEFAULT_EXPIRATION=300
    //         const cachedData = await redisCilent.get(`allUsernames`)
    //         if(cachedData!=null){
    //             let cachedUserNames =JSON.parse(cachedData)

    //             return res.status(StatusCodes.OK).json({users:cachedUserNames})
    //         }
    //         else{

    //             const userNames = await User.find({ }).select('username');

    //             redisCilent.setEx(`allUsernames`,DEFAULT_EXPIRATION,JSON.stringify(userNames))
                
                
    //             res.status(StatusCodes.OK).json({ users:userNames});

    //         }
    //     }catch(error){
    //         throw new BadRequestError("An error occurred")
    //     }   
    // }) 

    // await redisCilent.connect()

};


//cache
const showCurrentUser = async (req, res) => {
    // redisCilent = redis.createClient({
    //     url: 'redis://redis:6379'
    // })
    let userId;
    if(req.user._id){
        userId=req.user._id
    } 
    else if (req.user.userId){
        userId=req.user.userId 
    }
    else{
        userId='null'   
    }
    userId=='null'? loggedIn=false: loggedIn=true
    if (loggedIn==false) {
        throw new UnauthenticatedError("User is not logged in")
    }

    const myProfile = await User.findById(userId).select("-password -verificationToken")
    .populate({
        path:"following",
        select:"-password -verificationToken"
    })
    .populate({
        path:"followers",
        select:"-password -verificationToken"
    })
    .populate({
        path:"friends",
        select:"-password -verificationToken"
    })

    if (myProfile.isPersonalAcccountVerified===true) {
        let sumOfAllImpressions= myProfile.likedPosts.length*40 + myProfile.reposts.length*30  + myProfile.likedComments.length*2 + myProfile.quotes.length*2

        accountImpressions=sumOfAllImpressions
    }

    let sumOfAllImpressions= myProfile.likedPosts.length*32 + myProfile.reposts.length*22  + myProfile.likedComments.length + myProfile.quotes.length
    accountImpressions=sumOfAllImpressions


    // redisCilent.setEx(`userDetails-${userId}`,DEFAULT_EXPIRATION,JSON.stringify(userDetails, accountImpressions))
    
    
    res.status(StatusCodes.OK).json({ user: myProfile , accountImpressions});
     
    // redisCilent.on("connect",async ()=>{
    //     try{
    //         let DEFAULT_EXPIRATION=300
    //         const cachedData = await redisCilent.get(`userDetails-${userId}`)
    //         if(cachedData!=null){
    //             let cachedUser =JSON.parse(cachedData)

    //             return res.status(StatusCodes.OK).json({user:cachedUser})
    //         }
    //         else{

    //             const myProfile = await User.findById(userId).select("-password")
    //             .populate({
    //                 path:"following",
    //                 select:"-password"
    //             })
    //             .populate({
    //                 path:"followers",
    //                 select:"-password"
    //             })

    //             if (myProfile.isPersonalAcccountVerified===true) {
    //                 let sumOfAllImpressions= myProfile.likedPosts.length*40 + myProfile.reposts.length*30  + myProfile.likedComments.length*2 + myProfile.quotes.length*2

    //                 accountImpressions=sumOfAllImpressions
    //             }

    //             let sumOfAllImpressions= myProfile.likedPosts.length*32 + myProfile.reposts.length*22  + myProfile.likedComments.length + myProfile.quotes.length
    //             accountImpressions=sumOfAllImpressions


    //             redisCilent.setEx(`userDetails-${userId}`,DEFAULT_EXPIRATION,JSON.stringify(userDetails, accountImpressions))
                
                
    //             res.status(StatusCodes.OK).json({ user: userDetails , accountImpressions});

    //         }
    //     }catch(error){
    //         throw new BadRequestError("An error occurred")
    //     }   
    // }) 

    // await redisCilent.connect()
    
};
//cache




const updateUser = async (req, res) =>{
    // redisCilent = redis.createClient()
    let userId;
    if(req.user._id){
        userId=req.user._id
    } 
    else if (req.user.userId){
        userId=req.user.userId 
    }
    else{
        userId='null'   
    }
    userId=='null'? loggedIn=false: loggedIn=true
    if (loggedIn==false) {
        throw new UnauthenticatedError("User is not logged in")
    }
                   
    const {name,email,username,currentpassword,newPassword,role,interests,bio,link,pricingPlan,homeTown,relationshipStatus,placesLived,location,dateOfBirth,gender,language} =req.body
 
    let profileImg,coverImg;       
    req.files && req.files.profileImg? profileImg=req.files.profileImg:null 
    req.files && req.files.coverImg? coverImg=req.files.coverImg:null 
    let profileUploadedImgResponses  ;
    let coverUploadedImgResponses  ;
    // const uploadedVideoResponses = [];    

    let user = await User.findOne({_id:userId}).select("-password -wallet -verificationToken -googleId")

    if (!user) throw new NotFoundError("User not found")

    if (!currentpassword  && newPassword || currentpassword  && !newPassword  ) {
        throw new BadRequestError("Please provide both current and new password")
    } 

    if (currentpassword && newPassword) {
        const isMatch =await user.comparePassword(currentpassword)
        if (!isMatch) {
            throw new BadRequestError("Current password is not correct")
        }
        if (newPassword.length<8) {
            throw new BadRequestError("new password must be at least 8 characters long")
        }

        user.password = newPassword
    }

    if (profileImg) {
        const uploadedResponse = await cloudinary.uploader.upload(profileImg.tempFilePath,{ 
        use_filename: true,
        folder: 'profile-images',
        resource_type:'image',
        transformation: [
            {width: 1000, crop: "scale"},
            {quality: "auto", fetch_format: 'auto'},
            {fetch_format: "auto"}
        ]
        })   
        
        profileUploadedImgResponses = uploadedResponse.secure_url
    }                  

    if (coverImg) {

        const uploadedResponse = await cloudinary.uploader.upload(coverImg.tempFilePath,{ 
        use_filename: true,
        folder: 'cover-images',
        resource_type:'image',
        transformation: [
            {width: 1000, crop: "scale"},
            {quality: "auto", fetch_format: 'auto'},
            {fetch_format: "auto"}
        ]
        })
                        
        coverUploadedImgResponses = uploadedResponse.secure_url
    }         

    user.name = name || user.name
    user.email = email || user.email
    user.username = username || user.username
    user.role = role || user.role
    user.interests = interests || user.interests
    user.bio = bio || user.bio
    user.link = link || user.link
    user.homeTown = homeTown || user.homeTown
    user.relationshipStatus = relationshipStatus || user.relationshipStatus
    user.placesLived = placesLived || user.placesLived
    user.location = location || user.location
    user.pricingPlan = pricingPlan || user.pricingPlan
    // user.isPersonalAcccountVerified = isPersonalAcccountVerified || user.isPersonalAcccountVerified
    user.profileImage = profileUploadedImgResponses || user.profileImage
    user.coverImage = coverUploadedImgResponses || user.coverImage
    user.dateOfBirth = dateOfBirth || user.dateOfBirth
    user.gender = gender || user.gender
    user.language = language || user.language

    let user2 = await user.save()
   
    // let DEFAULT_EXPIRATION=86400
    // const userToCache = await User.findById(req.user.userId).select("-password")
    // .populate({
    //     path:"following",
    //     select:"-password"
    // })
    // .populate({
    //     path:"followers",
    //     select:"-password"
    // })
    

    // if (userToCache.isPersonalAcccountVerified===true) {
    //     let sumOfAllImpressions= userToCache.likedPosts.length*40 + userToCache.reposts.length*30  + userToCache.likedComments.length*2 + userToCache.quotes.length*2

    //     accountImpressions=sumOfAllImpressions
    // }

    // let sumOfAllImpressions= userToCache.likedPosts.length*32 + userToCache.reposts.length*22  + userToCache.likedComments.length + userToCache.quotes.length
    // userToCache.accountImpressions=sumOfAllImpressions

    // redisCilent.on("connect",async ()=>{
    //     try{
    //         redisCilent.setEx(`userDetails-${req.user.userId}`,DEFAULT_EXPIRATION,JSON.stringify(userToCache))
    //     }catch(error){
    //         throw new BadRequestError("An error occurred")
    //     }   
    // }) 
    
    // await redisCilent.connect()

    res.status(StatusCodes.OK).json(user2)

} 


module.exports={getAllUsers,getAllUsernames,showCurrentUser,updateUser} 