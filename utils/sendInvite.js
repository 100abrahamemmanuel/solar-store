const nodemailer = require('nodemailer')

const nodeMailerConfig = (options)=>{
    const transporter= nodemailer.createTransport({
        service : process.env.EMAIL_SERVICE,
        auth:{
            user:process.env.EMAIL_USERNAME,
            pass:process.env.EMAIL_PASSWORD
        }
    })

    const mailOptions ={
        from:options.from,
        to:options.to,
        subject:options.subject,
        html:options.text
    }

    transporter.sendMail(mailOptions,function (err,info) {
        if (err) {
            console.log(err)
        } else {
            console.log(info)
        }
    })
}


const SendInvite = async (user)=>{
    try {
        await nodeMailerConfig({
            to:user.email,
            from: user.to,
            subject:emailSubject,
            text:message
        })
        return res.status(StatusCodes.OK).json({ msg:'Email sent'})
    } catch (error) {
        throw new BadRequestError("Email could not be sent")
    }
}



module.exports=SendInvite