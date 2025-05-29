const { StatusCodes } = require("http-status-codes")
const Notification = require("../models/notification")
const { NotFoundError, UnauthenticatedError } = require("../errors")

// const userId = req.user.userId

const getNotifications = async (req,res)=>{
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
    
    const limit = parseInt(req.body.limit) || 10;
    const skipCount = req.body.skipCount ? req.body.skipCount : 0;
    const notifications = await Notification.find({to:userId}).populate({
        path:"from",
        select:"_id username profileImage pricingPlanDuration",
    })
    .skip(skipCount)
    .sort({ createdAt: -1 })
    .limit(limit)

    const notificationIds = notifications.map(notification => notification._id);

    if (notificationIds.length > 0) {
    await Notification.updateMany(
        { _id: { $in: notificationIds } }, // Match only the fetched IDs
        { read: true } // Update the `read` field
    );}

    await Notification.updateMany({to:userId},{read:true})

    res.status(StatusCodes.OK).json(notifications)
}

const updateRead = async (req,res)=>{
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
    
    const ids = req.body.ids ? req.body.ids : [];

    if (ids.length > 0) {
      await Notification.updateMany(
        { _id: { $in: ids }, to: userId },
        { $set: { read: true } }
      );
    }
    
    res.send('Notifications updated successfully.');
    
}

const deleteNotifications= async (req,res)=>{
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
    
    const limit = parseInt(req.body.limit) || 10;
    await Notification.deleteMany({to:userId})

    res.status(StatusCodes.OK).json({msg:'Notifications deleted successfully'})

}

const deleteOneNotifications =async (req,res)=>{
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
    const {id}= req.params

    const notification = Notification.findById(id)

    if (!notification) {
        throw new NotFoundError("Notification not found")
    }

    if (id !== userId) {
        throw new UnauthenticatedError("You are not allowed to delete this notification")
    }

    await Notification.findByIdAndDelete(id)
    res.status(StatusCodes.OK).json({msg:"Notification deleted successfully"})


}
module.exports={getNotifications,updateRead,deleteNotifications,deleteOneNotifications}