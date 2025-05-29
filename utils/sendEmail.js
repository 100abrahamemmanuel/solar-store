const nodeMailerConfig = require('./nodeMailerConfig')

const SendEmail = async (user)=>{
    try {
        await nodeMailerConfig({
            to:user.email,
            subject:emailSubject,
            text:message
        })
        return res.status(StatusCodes.OK).json({ msg:'Email sent'})
    } catch (error) {
        user.resetPasswordToken=undefined
        user.resetPasswordExpire=undefined

        await user.save()

        throw new BadRequestError("Email could not be sent")
    }
}



module.exports=SendEmail