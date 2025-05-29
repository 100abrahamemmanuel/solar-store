const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');
const AuthenticateUserSchema = new mongoose.Schema({
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
    
    tweatcoins:{
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
        
        tweatcoins: 1
    },
    unique:['email','phoneNumber'],
    sparse:['blockedUsers','tweatcoins']
})

AuthenticateUserSchema.pre('save',async function(next){
    // since we added required true in the schema this help use bypass it because we are not changing the password in forgot password route
    if (!this.isModified("password")) {
        next()
    }
    // calling the bcrypt method to generate things
    // const salt = await bcrypt.genSalt(10)
    // mapping it to the password or hashing the password in your document
    // this.password = await bcrypt.hash(this.password,salt)
    this.password = this.password
})

AuthenticateUserSchema.methods.createJWT= function () {
    return jwt.sign(
        {userID:this._id,name:this.name},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_LIFETIME}
    )
}

AuthenticateUserSchema.methods.comparePassword=async function (usersPassword) {
    const isMatch = await bcrypt.compare(usersPassword,this.password)
    return isMatch
}

AuthenticateUserSchema.methods.getResetPasswordToken= function () {
    const resetToken = crypto.randomBytes(70).toString("hex")
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire= Date.now() + 10 * (60*1000)// 10 minutes
    return resetToken
}

const Authuser = mongoose.model('authuser', AuthenticateUserSchema);


  

module.exports= Authuser