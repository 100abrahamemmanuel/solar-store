const {StatusCodes} = require('http-status-codes')
const { CustomAPIError } = require('../errors')

// why we are doing this is because we want to send more user friendly error messages than to send bunch of messages, so when we recieve errors we created in that error folder we will now simplify them here before sending it to the client

// errors we want to handle
// validation
// Duplicate (emails)
// Cast Error (when the id doesn't match || the user id doesn't match the tasks or projects you want to get)



const ErrorHandlerMiddleware = async (err,req,res,next)=>{

    // set as default
    let customError={
        statusCode : err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong, please try again later'
    }

    if (err.name === "ValidationError") {
        customError.msg=Object.values(err.errors).map((items)=>items.message).join(',')
        customError.statusCode=StatusCodes.NOT_FOUND
    }

    if (err.code && err.code === 11000) {
        customError.msg=`Duplicate value ${Object.keys(err.keyValue)} filled, please choose another value`
        customError.statusCode=StatusCodes.NOT_FOUND
    }
    if (err.name === "CastError") {
        customError.msg=`No item found with this id:${err.value}`
        customError.statusCode=StatusCodes.NOT_FOUND
    }

    return res.status(customError.statusCode).json({msg:customError.msg})


}

module.exports=ErrorHandlerMiddleware