const User = require('../models/User');
const Post = require('../models/post');
const Stories = require("../models/stories");
const Tales = require("../models/tales");
const channel = require('../models/channel');
const community = require('../models/community');
const channelPosts = require('../models/channelPost');
const communityPosts = require('../models/communityPosts');
const Transactions = require("../models/transactionHistories")
const   Notification = require('../models/notification');
const {  NotFoundError , BadRequestError, UnauthenticatedError} = require("../errors");
const { StatusCodes } = require('http-status-codes');


const upgradeAccount = async (req,res)=>{
    
    
}

const promoteContent = async (req,res)=>{
    
}


module.exports={upgradeAccount,promoteContent}