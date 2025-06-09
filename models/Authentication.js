const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');

const AuthenticateUserSchema = new mongoose.Schema(
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
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide your birth date'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
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
    verificationToken: {
      type: String,
      default: '',
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Indexing to enforce uniqueness while allowing optional phone numbers
// AuthenticateUserSchema.index({ email: 1 }, { unique: true });
// AuthenticateUserSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true });

// Middleware for password hashing
AuthenticateUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  next();
});

// Generate JWT token
AuthenticateUserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userID: this._id, name: this.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
};

 
// Generate password reset token
AuthenticateUserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const AuthUser = mongoose.model('AuthUser', AuthenticateUserSchema);

module.exports = AuthUser;