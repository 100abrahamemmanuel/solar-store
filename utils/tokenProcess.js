const jwt = require('jsonwebtoken');
const zlib = require('zlib')

const createJWToken = ({payload})=>{
    const token = jwt.sign({payload},process.env.JWT_SECRET)
    // const compressedToken = zlib.deflateSync(token).toString('base64');
    return token
}

const isTokenValid = (token) => { 
    
    // const token = compressedToken
    // const token = zlib.inflateSync(Buffer.from(compressedToken, 'base64')).toString(); 
    const payload= jwt.verify(token, process.env.JWT_SECRET);
    return payload; 
};

// const isTokenValid = (token)=> jwt.verify(token, process.env.JWT_SECRET)


const attachResponseToCookie= ({res,user,refreshToken})=>{
    const accessTokenJWT = createJWToken({payload:{user}})
    const refreshTokenJWT = createJWToken({payload:{user,refreshToken}})

    const oneDay = 1000 * 60 * 60 * 24
    const longerDay =1000 * 60 * 60 * 24 * 30
    
    res.cookie('accessToken',accessTokenJWT,{
        secure: process.env.NODE_ENV==='production',
        signed:true,
        expires: new Date (Date.now() + oneDay)
    })
    res.cookie('refreshToken',refreshTokenJWT,{
        secure:process.env.NODE_ENV==='production',
        signed: true,
        expires: new Date(Date.now() + longerDay)
    })
    
}

module.exports={
    createJWToken,
    isTokenValid,
    attachResponseToCookie
}