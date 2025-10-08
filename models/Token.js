const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema(
    {
        refreshToken:{type:String,required:true},
        ip:{type:String, required:true},
        userAgent:{type:String, required:true},
        isValid:{type:Boolean, default:true},
        user:{
            type:mongoose.Types.ObjectId, 
            ref:'users',
            required:true
        },
    },{timestamps:true}
)



const Token = mongoose.model('Token', TokenSchema);

// Create indexes
Token.createIndexes({ user: 1 });
Token.createIndexes({ isValid: 1 });
Token.createIndexes({ refreshToken: 1 }, { unique: true });



// This code creates indexes on the following fields:

// - user
// - isValid
// - refreshToken (unique)

// Note that I used unique: true for the refreshToken field to ensure that each refresh token is unique.


module.exports = Token;