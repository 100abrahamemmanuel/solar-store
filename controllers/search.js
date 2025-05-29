const User = require('../models/User');
const Channel = require('../models/channel');
const Community = require('../models/community');
const Post = require('../models/post');
const channelPosts = require('../models/channelPost');
const communityPost = require('../models/communityPosts');
const {  NotFoundError } = require("../errors");
const { StatusCodes } = require('http-status-codes');
const redis= require("redis")
let redisCilent ;


const advancedSearch = async (req,res)=>{

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
    
    const {md} = req.query
    let {skipCount}= req.body
    let username , channelname , communityname;
    let trendContent= md;
    let channelContent = md;
    let postsContent = md;

    
    if (md.startsWith("@") ) {
        username = md.slice(1)
        channelname = md.slice(1)
        communityname = md.slice(1)
    }else{
        username = md   
        channelname = md
        communityname = md
    }

    const user = await User.findOne({username}) ||  {}

   

    res.status(StatusCodes.OK).json({user,posts:updatedPosts,Channels:channel,Communities:community,Trends:updatedTrend,communityPosts:updatedCommunityPosts}) 

}


module.exports={advancedSearch}