const { UnauthenticatedError} = require("../errors")
const Token = require("../models/Token")
const { attachResponseToCookie, isTokenValid } = require("../utils")


const authenticateUser = async (req, res, next) => {
  const signedCookies = JSON.parse(req.body.signedCookies); 
  const { refreshToken, accessToken } = signedCookies;
    try {
      if (accessToken) {
        const payload = isTokenValid(accessToken);
         

        if(payload.payload.tokenUser){
          req.user =payload.payload.tokenUser
          return next();
        } 
        else if (payload.payload.user){
          req.user = payload.payload.user;
          return next();
        }
        
      } 
      if (!accessToken && !refreshToken) {
        req.user = 'null';  
        return next();
      }  
      const payload = isTokenValid(refreshToken);
      const existingToken = await Token.findOne({
        user: payload.payload.user.userId,
        refreshToken: payload.payload.refreshToken,
      });
      
      if (!existingToken || !existingToken?.isValid) {
        throw new UnauthenticatedError('Authentication Invalid');
      } 
  
      attachResponseToCookie({
        res,
        user: payload.user,
        refreshToken: existingToken.refreshToken,
      });
  
      req.user = payload.user;
      next();
    } catch (error) {
      console.log(error)
      throw new UnauthenticatedError('Authentication Invalid');
    }
};  


const authorizePermission =  (...roles)=>{
    return (req,res,next)=>{
      
      if (!roles.includes(req.user.role)) {
        throw new UnauthenticatedError(
          'Unauthorized to access this route'
        );
      }
        next() 
    }
}
module.exports= {
    authenticateUser, 
    authorizePermission
}