const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please provide your full name"],
        trim: true,
        minLength:3,
        maxLength:50
    },
    username:{
        type:String,
        required:[true,"Please provide your preferred username"],
        minLength:3,
        maxLength:50,
        trim: true,
        unique:true
    },
    email:{
        type:String,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email',
        },
        unique:'composite/_id' // creates a unique index, it is not a validator, incase you are trying to crate a user with that email we will recieve a duplicate error message
    },
    phoneNumber:{
        type:String,
        trim: true,
        validate:{
            validator:function(value){
                return validator.isMobilePhone(value,'any')
            },
            message:'Please provide valid PhoneNumber'
        },
        unique:'composite/_id' // creates a unique index, it is not a validator, incase you are trying to crate a user with that email we will recieve a duplicate error message
    },
    dateOfBirth:{
        type: Date,
        required: [true,"Please provide your birth date"],
        trim: true,
    },
    gender:{
        type:String,
        enum:["female","male","custom"]
    },
    password:{
        type:String,
        required:[true,'Please provide password '],
        trim: true,
        minLength:8
    },
    followers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            default:[]
        }
    ],
    following:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            default:[]
        }
    ],
    friends:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            default:[]
        }
    ],
    googleId:{
        type:String,
        trim:true,
        default:""
    },
    homeTown:{
        type:String,
        trim:true,
        default:""
    },
    relationshipStatus:{
        type:String,
        trim:true,
        default:""
    },
    placesLived:{
        type:String,
        trim:true,
        default:""
    },
    pricingPlan:{
        type:String,
        default:'basic',
        enum:['basic','premium','pro'] 
    },
    role:{
        type:String,
        enum:['admin','admin2','user','founders','creators'],
        default:'user',
    },
    profileImage:{
        type:String,
        default:""
    },
    coverImage:{
        type:String,
        default:""
    },
    bio:{
        type:String,
        default:"",
        maxlength:[2000,"Text must not exceed 130 characters"]
    },
    link:{
        type:String,
        default:""
    },
    likedPosts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    flags:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    likedComments:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    likedreplies:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    pinnedPosts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    mutePosts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    accountViews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            default:[]
        }
    ],
    interests:[
        {
            type:String,
            ref:'users',
            default:[]
        }
    ],
    blockedUsers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            default:[]
        }
    ],
    muteUsers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            default:[]
        }
    ],
    mutePosts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    reposts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    quotes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post",
            default:[]
        }
    ],
    location:{
        type:String,
        trim:true,
        default:""
    },
    language:{
        type:String,
        trim:true,
        default:""
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    wallet:{
        type:Number,
        default:0,
    },
    tweatcoins:{
        type:Number,
        default:0,
    },
    aura:{
        type:Number,
        default:0,
    },
    pricingPlanDuration:{
        type:Date,
    },
    verified:{
        type:Date,
    },
    verificationToken:{
        type:String,
        default:""
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    suspended:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true,
    index:{
        email:1,
        phoneNumber:1,
        followers: 1,
        following: 1,
        friends: 1,
        likedPosts: 1, 
        flags: 1,
        likedComments: 1, 
        likedreplies: 1, 
        pinnedPosts: 1, 
        mutePosts: 1,
        accountViews: 1,
        interests: 1,
        blockedUsers: 1,
        muteUsers: 1,
        wallet: 1,
        tweatcoins: 1
    },
    unique:['email','phoneNumber'],
    sparse:['followers','following','friends','likedPosts','flags','likedComments','likedreplies','pinnedPosts','mutePosts','accountViews','interests','blockedUsers','muteUsers','tweatcoins','wallet']
})

UserSchema.pre('save',async function(next){
    // since we added required true in the schema this help use bypass it because we are not changing the password in forgot password route
    if (!this.isModified("password")) {
        next()
    }
    // calling the bcrypt method to generate things
    const salt = await bcrypt.genSalt(10)
    // mapping it to the password or hashing the password in your document
    this.password = await bcrypt.hash(this.password,salt)
})

UserSchema.methods.createJWT= function () {
    return jwt.sign(
        {userID:this._id,name:this.name},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_LIFETIME}
    )
}

UserSchema.methods.comparePassword=async function (usersPassword) {
    const isMatch = await bcrypt.compare(usersPassword,this.password)
    return isMatch 
}

UserSchema.methods.getResetPasswordToken= function () {
    const resetToken = crypto.randomBytes(5).toString("hex")
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire= Date.now() + 10 * (60*1000)// 10 minutes
    return resetToken
}

const User = mongoose.model('users', UserSchema);

// Create unique indexes

// User.createIndexes({ email: 1,phoneNumber: 1,username: 1 }, { unique: true });
// User.createIndexes({ followers: 1, following: 1,friends: 1,likedPosts: 1, flags: 1,likedComments: 1, likedreplies: 1, pinnedPosts: 1, mutePosts: 1,accountViews: 1,interests: 1,blockedUsers: 1,muteUsers: 1 }, { sparse: true });
// User.createIndex({ phoneNumber: 1 }, { unique: true });
// User.createIndex({ username: 1 }, { unique: true });

// Create sparse indexes
// User.createIndex({ followers: 1 }, { sparse: true });
// User.createIndex({ following: 1 }, { sparse: true });
// User.createIndex({ friends: 1 }, { sparse: true });
// User.createIndex({ likedPosts: 1 }, { sparse: true });
// User.createIndex({ flags: 1 }, { sparse: true });
// User.createIndex({ likedComments: 1 }, { sparse: true });
// User.createIndex({ likedreplies: 1 }, { sparse: true });
// User.createIndex({ pinnedPosts: 1 }, { sparse: true });
// User.createIndex({ mutePosts: 1 }, { sparse: true });
// User.createIndex({ accountViews: 1 }, { sparse: true });
// User.createIndex({ interests: 1 }, { sparse: true });
// User.createIndex({ blockedUsers: 1 }, { sparse: true });
// User.createIndex({ muteUsers: 1 }, { sparse: true });

// // Create a regular index
// User.createIndexes({ name: 1 });



module.exports= User