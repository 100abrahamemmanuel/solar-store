require('dotenv').config()
require('express-async-errors');
const express = require('express')
const app = express()
const Product = require('./models/product');
const fileUpload = require('express-fileupload');

 

const cors = require('cors') 
// imports
const cookiesParser = require('cookie-parser') 
const session = require('express-session')
// const passport = require('passport');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})


// middleware
const notFoundMiddleware = require('./middlewares/not-found')
const ErrorHandlerMiddleware = require('./middlewares/errorHandler') 

// db 
const connectDB = require('./db/connect')

// Extra packages
app.use(express.json())
app.use(fileUpload({ 
    useTempFiles: true, tempFileDir: '/tmp/', limits: { fileSize: 50 * 1024 * 1024 } // 50MB file size limit 
}));
app.use(cookiesParser(process.env.JWT_SECRET))
app.set('trust proxy', 1) 

const initialExpirationTime = 30 * 60;
 
app.use(session({ 
  secret: process.env.SESSION_SECRET,   
  resave: true, 
  saveUninitialized: true,
}))
// app.use(passport.initialize())  
// app.use(passport.session()) 
app.use(cors({
    origin: true, // Specify your frontend origin okay
    credentials: true,
}))



// tstore
const authRouter = require('./routes/authentication');
const productRouter = require('./routes/product');
const reviewRouter = require('./routes/review');
const orderRouter = require('./routes/order');

// using routers
app.use('/api/v1/auth',authRouter)
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

// error-handlers  

app.use(notFoundMiddleware)
app.use(ErrorHandlerMiddleware) 



// PORT
const PORT = process.env.PORT || 8000

const start = async ()=>{
    try {
        await connectDB(process.env.MONGO_URI)

        app.listen(PORT,()=>{
            
            console.log(`server is listening on port: ${PORT}...`)
        })
    } catch (error) { 
        console.error(error) 
    }
}  
  
start()
