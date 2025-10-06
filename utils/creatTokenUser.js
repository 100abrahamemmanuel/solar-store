
const creatTokenUser = (user)=>{
    
    // return { name: user.name,username:user.username,email: user.email, userId: user._id, role: user.role,location:user.location,language: user.language,phoneNumber:user.phoneNumber, accountType :user.accountType, pricingPlan: user.pricingPlan,pricingPlanDuration: user.pricingPlanDuration,homeTown : user.homeTown,relationshipStatus:user.relationshipStatus,placesLived:user.placesLived,profileImage:user.profileImage,coverImage:user.coverImage,tweatstars:user.tweatstars,wallet:user.wallet,likedPosts: user.likedPosts, likedComments:user.likedComments,mutePosts: user.mutePosts,accountViews: user.accountViews,interests:user.interests,blockedUsers: user.blockedUsers,groups:user.groups,members:user.members,googleId:user.googleId,followers:user.followers,friends:user.friends,following:user.following,bio:user.bio,link:user.link}
    return { _id: user._id}
}


module.exports=creatTokenUser