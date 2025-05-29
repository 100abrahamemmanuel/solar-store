
// the whole algorithm for sorting

// suggested users
function gettingSuggestedUsersFullStructuredAlgorithm(suggestedUsers,currentUser){
  
    function interest(suggestedUsers,currentUser){

      let filteredInterested=[]


      for(let i = 0; i<suggestedUsers.length;i++){
        let interstSet = new Set(suggestedUsers[i].interests)
        let currentinterstSet = new Set(currentUser.interests)
        for (let value of interstSet){
        if(currentinterstSet.has(value)){
          filteredInterested.push(suggestedUsers[i])
        }
        }
      }


      return filteredInterested
    
    
    }
  
    function place(users,me){
      let filtered=[]
      for(let values of users){
        if(values.location===me.location)
        filtered.push(values)
      }
      return filtered
    }
  
  
  
    function notPlace(users,me){
      let filtered=[]
      for(let values of users){
        if(values.location!==me.location)filtered.push(values)
      }
      return filtered
    }
  
    function notBlocked(users,me){
      let filtered=[]
      for(let values of users){
        if(!me.blockedUsers.includes(values._id))filtered.push(values)

      }
      return filtered
    }


    function notFollowing(users,me){

      let filtered=[]

      for(let values of users){

        if(!me.following.includes(values._id))filtered.push(values)

      }
      return filtered
    }
  
    function isPersonalAccountVerified(users){
      let filtered=[]
      
      for (let values of users){

        if(values.isPersonalAcccountVerified===true){

          filtered.push(values)

        }
      }
      return filtered
    }
    const notInterested = notBlocked(notFollowing(suggestedUsers,currentUser),currentUser)
    const basedOnYourInterest =  interest(suggestedUsers,currentUser)
    const notFollowed=notFollowing(basedOnYourInterest,currentUser)
    const unBlockedUsers =notBlocked(notFollowed,currentUser) 
    const yourLocation = place(unBlockedUsers,currentUser)
    const notYourLocation = notPlace(unBlockedUsers,currentUser) 
    // const verifiedPersonalAccount =isPersonalAccountVerified(unBlockedUsers)
  
  
    const duplicates =[...unBlockedUsers,...yourLocation,...notYourLocation,...notInterested]
    const allTheSuggestedUsersBasedOnAllProvidedCategories=[...new Set(duplicates)]


    const allTheSuggestedUsersSortedAccurately =allTheSuggestedUsersBasedOnAllProvidedCategories.sort((a,b)=>{
      return b.impressions-a.impressions
    })
    this.returningUsersFromTheAlgorithm=allTheSuggestedUsersSortedAccurately
}

// suggested posts

function gettingSuggestedPostsFullStructuredAlgorithm(suggestedPosts,currentUser){
  
  
  function interest(suggestedPosts,currentUser){

    let filteredInterested=[]

    // for(let i = 0; i<suggestedPosts.length;i++){
    //   let interstSet = new Set(suggestedPosts[i].user.interests)
    //   let currentinterstSet = new Set(currentUser.interests)
    //   for (let value of interstSet){
    //     if(currentinterstSet.has(value)){
    //       filteredInterested.push(suggestedPosts[i])
          
    //     }
        
    //   }
    // }
    for (let i = 0; i < suggestedPosts.length; i++) {
      // Check if interests exist; if not, skip to the next iteration
      if (!suggestedPosts[i].user.interests) {
          continue;
      }
  
      let interstSet = new Set(suggestedPosts[i].user.interests);
      let currentinterstSet = new Set(currentUser.interests);
  
      for (let value of interstSet) {
          if (currentinterstSet.has(value)) {
              filteredInterested.push(suggestedPosts[i]);
              break; // Break the inner loop if a match is found
          }
      }
    }
  

    return filteredInterested
  
  
  }
  function place(usersPosts,me){
    let filtered=[]
    for(let values of usersPosts){
      if(values.user.location===me.location)filtered.push(values)
    }
    return filtered
  }



  function notPlace(usersPosts,me){
    let filtered=[]
    for(let values of usersPosts){
      if(values.user.location!==me.location)filtered.push(values)
    }
    return filtered
  }

  function notMutedPostsAndUsers(usersPosts,me){
    let filtered=[]
    for(let values of usersPosts){
      if(!me.mutePosts.includes(values._id) && !me.muteUsers.includes(values.user._id))filtered.push(values)

    }
    return filtered
  }

  function notBlocked(usersPosts,me){
    let filtered=[]
    for(let values of usersPosts){
      if(!me.blockedUsers.includes(values.user._id))filtered.push(values)

    }
    return filtered
  }

  
  // function isPersonalAccountVerified(usersPosts){
  //   let filtered=[]
    
  //   for (let values of usersPosts){

  //     if(values.user.isPersonalAcccountVerified===true){

  //       filtered.push(values)

  //     }
  //   }
  //   return filtered
  // }
  
  const basedOnYourInterest =  interest(suggestedPosts,currentUser)
  const notYourInterest =  notBlocked(suggestedPosts,currentUser)
  const notYourInterestAndBasedonNotMutedPostsAndUsers =  notMutedPostsAndUsers(notYourInterest,currentUser)
  const basedonNotMutedPostsAndUsers =  notMutedPostsAndUsers(basedOnYourInterest,currentUser)
  const unBlockedUsers =notBlocked(basedonNotMutedPostsAndUsers,currentUser)
  const yourLocation = place(unBlockedUsers,currentUser)
  const notYourLocation = notPlace(unBlockedUsers,currentUser)
  // const verifiedPersonalAccount =isPersonalAccountVerified(unBlockedUsers)

 
  let duplicates =[...unBlockedUsers,...yourLocation]

  if(!duplicates){
    duplicates = [...notYourLocation,...notYourInterestAndBasedonNotMutedPostsAndUsers] 
  }

  const allTheSuggestedPostsBasedOnAllProvidedCategories=[...new Set(duplicates)]
   
  this.returningPostFromTheAlgorithm= allTheSuggestedPostsBasedOnAllProvidedCategories
    

}

//stories

function gettingSuggestedStoriesFullStructuredAlgorithm(suggestedUsers,currentUser){
  function interest(suggestedUsers,currentUser){

    let filteredInterested=[]


    for(let i = 0; i<suggestedUsers.length;i++){
      let interstSet = new Set(suggestedUsers[i].interests)
      let currentinterstSet = new Set(currentUser.interests)
      for (let value of interstSet){
      if(currentinterstSet.has(value)){
        filteredInterested.push(suggestedUsers[i])
      }
      }
    }


    return filteredInterested
  
  
  }

  function place(users,me){
    let filtered=[]
    for(let values of users){
      if(values.location===me.location)
      filtered.push(values)
    }
    return filtered
  }



  function notPlace(users,me){
    let filtered=[]
    for(let values of users){
      if(values.location!==me.location)filtered.push(values)
    }
    return filtered
  }

  function notBlocked(users,me){
    let filtered=[]
    for(let values of users){
      if(!me.blockedUsers.includes(values._id))filtered.push(values)

    }
    return filtered
  }


  function notFollowing(users,me){

    let filtered=[]

    for(let values of users){

      if(!me.following.includes(values._id))filtered.push(values)

    }
    return filtered
  }

  function isPersonalAccountVerified(users){
    let filtered=[]
    
    for (let values of users){

      if(values.isPersonalAcccountVerified===true){

        filtered.push(values)

      }
    }
    return filtered
  }
  const notInterested = notBlocked(notFollowing(suggestedUsers,currentUser),currentUser)
  const basedOnYourInterest =  interest(suggestedUsers,currentUser)
  const notFollowed=notFollowing(basedOnYourInterest,currentUser)
  const unBlockedUsers =notBlocked(notFollowed,currentUser) 
  const yourLocation = place(unBlockedUsers,currentUser)
  const notYourLocation = notPlace(unBlockedUsers,currentUser) 
  // const verifiedPersonalAccount =isPersonalAccountVerified(unBlockedUsers)


  let duplicates =[...unBlockedUsers,...yourLocation]

  
  if(!duplicates){
    duplicates = [...notYourLocation,...notInterested] 
  }

  const allTheSuggestedUsersBasedOnAllProvidedCategories=[...new Set(duplicates)]


  const allTheSuggestedUsersSortedAccurately =allTheSuggestedUsersBasedOnAllProvidedCategories.sort((a,b)=>{
    return b.impressions-a.impressions
  })
  this.returningUsersFromTheAlgorithm=allTheSuggestedUsersSortedAccurately
}

//Tales (audio blogs)

function gettingSuggestedTalesFullStructuredAlgorithm(suggestedUsers,currentUser){
  function interest(suggestedUsers,currentUser){

    let filteredInterested=[]


    for(let i = 0; i<suggestedUsers.length;i++){
      let interstSet = new Set(suggestedUsers[i].interests)
      let currentinterstSet = new Set(currentUser.interests)
      for (let value of interstSet){
      if(currentinterstSet.has(value)){
        filteredInterested.push(suggestedUsers[i])
      }
      }
    }


    return filteredInterested
  
  
  }

  function place(users,me){
    let filtered=[]
    for(let values of users){
      if(values.location===me.location)
      filtered.push(values)
    }
    return filtered
  }



  function notPlace(users,me){
    let filtered=[]
    for(let values of users){
      if(values.location!==me.location)filtered.push(values)
    }
    return filtered
  }

  function notBlocked(users,me){
    let filtered=[]
    for(let values of users){
      if(!me.blockedUsers.includes(values._id))filtered.push(values)

    }
    return filtered
  }


  function notFollowing(users,me){

    let filtered=[]

    for(let values of users){

      if(!me.following.includes(values._id))filtered.push(values)

    }
    return filtered
  }

  function isPersonalAccountVerified(users){
    let filtered=[]
    
    for (let values of users){

      if(values.isPersonalAcccountVerified===true){

        filtered.push(values)

      }
    }
    return filtered
  }
  const notInterested = notBlocked(notFollowing(suggestedUsers,currentUser),currentUser)
  const basedOnYourInterest =  interest(suggestedUsers,currentUser)
  const notFollowed=notFollowing(basedOnYourInterest,currentUser)
  const unBlockedUsers =notBlocked(notFollowed,currentUser) 
  const yourLocation = place(unBlockedUsers,currentUser)
  const notYourLocation = notPlace(unBlockedUsers,currentUser) 
  // const verifiedPersonalAccount =isPersonalAccountVerified(unBlockedUsers)


  let duplicates =[...unBlockedUsers,...yourLocation]

  
  if(!duplicates){
    duplicates = [...notYourLocation,...notInterested] 
  }

  const allTheSuggestedUsersBasedOnAllProvidedCategories=[...new Set(duplicates)]


  const allTheSuggestedUsersSortedAccurately =allTheSuggestedUsersBasedOnAllProvidedCategories.sort((a,b)=>{
    return b.impressions-a.impressions
  })
  this.returningUsersFromTheAlgorithm=allTheSuggestedUsersSortedAccurately
}

module.exports={
  gettingSuggestedUsersFullStructuredAlgorithm,
  gettingSuggestedPostsFullStructuredAlgorithm,
  gettingSuggestedStoriesFullStructuredAlgorithm,
  gettingSuggestedTalesFullStructuredAlgorithm
} 