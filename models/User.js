const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    email:{
        type:String,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email',
        },
        unique:'composite/_id' // creates a unique index, it is not a validator, incase you are trying to crate a user with that email we will recieve a duplicate error message
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide your birth date'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['female', 'male', 'custom'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      trim: true,
      minLength: 8,
    },
    googleId: {
      type: String,
      trim: true,
      default: '',
    },
    homeTown: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    language: {
      type: String,
      trim: true,
      default: '',
    },
    isVerified:{
      type:Boolean,
      default:false,
    },
    verificationToken: {
      type: String,
      default: '',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Indexes ensuring uniqueness
// UserSchema.index({ email: 1 }, { unique: true });
// UserSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

// Middleware for password hashing

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
    // console.log(isMatch)
    return isMatch 
}

UserSchema.methods.getResetPasswordToken= function () {
    const resetToken = crypto.randomBytes(5).toString("hex")
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire= Date.now() + 10 * (60*1000)// 10 minutes
    return resetToken
}
const User = mongoose.model('User', UserSchema);

module.exports = User;