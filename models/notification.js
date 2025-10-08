const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true,
    },
    profileImage:{
        type:String
    },
    name:{
        type:String
    },
    username:{
        type:String
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true,
    },
    postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,
    },
    origin:{
        type:String,
        enum:["post","comment","reply","communityPost","channelPost",'stories',"tales"],
    },
    amount:{
        type:String
    },
    type:{
        type:String,
        required:true,
        enum:["follow","comment","reply","flagged","likes","repost","quote","tagged","Permission to join community","Permission to friend you","tweatstars","login","unsuspended","Approval to join  a community"]
    },
    read:{
        type:Boolean,
        default:false
    }
},
    {timestamps:true}
)

const notification = mongoose.model('Notification',notificationSchema)

notification.createIndexes({ from: 1 }); // Indexes on 'from' field
notification.createIndexes({ to: 1 }); // Indexes on 'to' field
notification.createIndexes({ type: 1 }); // Indexes on 'type' field
notification.createIndexes({ read: 1 }); // Indexes on 'read' field


module.exports=notification