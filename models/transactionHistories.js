const mongoose = require('mongoose');

const TransactionsSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Types.ObjectId, 
            ref:'users',
            required:true
        },
        type:{
            type:String,
            required:true,
            enum:["tweatstars","advertisement","accountUpgrade"]
        },
        ip:{type:String, required:true},
        userAgent:{type:String, required:true},
    },{timestamps:true}
)



const Transactions = mongoose.model('Transactions', TransactionsSchema);

// Create indexes
Transactions.createIndexes({ user: 1 });
Transactions.createIndexes({ type: 1 });



// This code creates indexes on the following fields:

// - user


module.exports = Transactions;