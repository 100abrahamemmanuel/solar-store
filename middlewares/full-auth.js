const { UnauthenticatedError } = require("../errors");

const authenticateUser =async (req,res,next)=>{
    let token;

    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1]
    }
    else if (req.signedCookies.payload){

    }

}

module.exports={authenticateUser}

// not using yet