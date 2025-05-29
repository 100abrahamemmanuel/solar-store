const { UnauthenticatedError } = require("../errors");

// this function is just to check when the user is gettting a tasks or a project if it's for the person and if he/she is an admin using the token from ./middleware/authentication.js

const  checkPermission = (requestUser,resourceUser)=>{
    if (requestUser.role=== 'admin') return;
    if (requestUser.userId === resourceUser.userId) return;
    throw new UnauthenticatedError(
        'Not authorized to access this route'
    );
}
const  checkPermission2 = (requestUser,resourceUser)=>{
    if (requestUser.userId === resourceUser.userId) return;
    throw new UnauthenticatedError(
        'Not authorized to access this route'
    );
}

module.exports= {checkPermission,checkPermission2}