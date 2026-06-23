import User from "../model/userModel.js";
import response from "../utils/responseHandler.js";
const followUser = async (req, res) => {
  // Request body se follow karne wale user ka ID lena
  const { userIdToFollow } = req.body;
  // Jo user follow kar raha hai uska ID lena (authentication middleware se aayega)
  const userId = req.user?.userId;

  // Agar user khud ko follow karne ki koshish kare to error dena
  if (userId === userIdToFollow) {
    return response(res, 400, "You are not allowed to follow yourself");
  }

  try {
    // Database se dono users ka data fetch karna
    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(userId);

    // Check karna ki dono users exist karte hain ya nahi
    if (!userToFollow || !currentUser) {
      return response(res, 404, "User not found");
    }

    // Agar user pehle se hi follow kar raha hai to error dena
    if (currentUser.followings.includes(userIdToFollow)) {
      return response(res, 400, "You are already following this user");
    }

    // Current user ki followings list me naye user ka ID add karna
    currentUser.followings.push(userIdToFollow);
    // Jise follow kiya uski followers list me current user ka ID add karna
    userToFollow.followers.push(userId);

    // Dono users ke follow count update karna
    currentUser.followingCount += 1;
    userToFollow.followerCount += 1;

    // Database me updated data save karna
    await currentUser.save();
    await userToFollow.save();

    // Success response return karna
    return response(res, 200, "User followed successfully");
  } catch (error) {
    // Agar koi error aata hai to uska response bhejna
    return response(res, 500, "Internal server error", error.message);
  }
};

const unFollowUser = async (req, res) => {
  const { userIdToUnFollow } = req.body;
  const userId = req.user?.userId;

  if (userId === userIdToUnFollow) {
    return response(res, 400, "You are not allowed to unfollow yourself");
  }

  try {
    const userToUnFollow = await User.findById(userIdToUnFollow);
    const currentUser = await User.findById(userId);

    if (!userToUnFollow || !currentUser) {
      return response(res, 404, "User not found");
    }

    if (!currentUser.followings.includes(userIdToUnFollow)) {
      return response(res, 400, "You are not following this user");
    }

    // Remove user from follow lists
    currentUser.followings = currentUser.followings.filter(
      (id) => id.toString() !== userIdToUnFollow
    );
    userToUnFollow.followers = userToUnFollow.followers.filter(
      (id) => id.toString() !== userId
    );

    // Ensure counts don't go below zero
    currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
    userToUnFollow.followerCount = Math.max(
      0,
      userToUnFollow.followerCount - 1
    );

    await currentUser.save();
    await userToUnFollow.save();

    return response(res, 200, "User unfollowed successfully");
  } catch (error) {
    return response(res, 500, "Internal server error", error.message);
  }
};

const deleteUserFromRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId; // The user rejecting the request
    const { requestSenderId } = req.body; // The user who sent the follow request

    // Fetch both users from the database
    const requestSender = await User.findById(requestSenderId);
    const loggedInUser = await User.findById(loggedInUserId);

    // Check if both users exist
    if (!requestSender || !loggedInUser) {
      return response(res, 404, "User not found");
    }

    // Check karenge ki requestSender ne logged-in user ko follow kiya hai ya nahi.
    const isRequestSend = requestSender.followings.includes(loggedInUserId);
    if (!isRequestSend) {
      return response(res, 404, "No Request Found For This User");
    }

    // Remove the logged-in user's ID from the request sender's followings list
    requestSender.followings = requestSender.followings.filter(
      (user) => user.toString() !== loggedInUserId
    );

    // Remove the request sender's ID from the logged-in user's followers list
    loggedInUser.followers = loggedInUser.followers.filter(
      (user) => user.toString() !== requestSenderId
    );

    // Update follow counts
    loggedInUser.followerCount = loggedInUser.followers.length;
    requestSender.followingCount = requestSender.followings.length; // Fix: It should be 'followingCount', not 'followerCount'

    // Save the updated data for both users
    await loggedInUser.save();
    await requestSender.save();

    // Send success response
    return response(
      res,
      200,
      `Friend Request From ${requestSender.username} deleted successfully `
    );
  } catch (error) {
    return response(res, 500, "Internal server error", error.message);
  }
};

// get all friend jisne logged in user ko request bheja hai
const getAllFriendRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    
    // Find the logged-in user's followers and followings
    const loggedInUser = await User.findById(loggedInUserId).select(
      "followers followings"
    );
    
    if (!loggedInUser) {
      return response(res, 404, "User Not Found");
    }


    // Find users who follow the logged-in user but are not followed back by the logged-in user
    const userToFollowBack = await User.find({
      _id: {
        $in: loggedInUser.followers, // Jo users logged-in user ko follow kar rahe hain
        $nin: loggedInUser.followings, // Unko hata do jinko logged-in user already follow kar raha hai taki sirf unka data he aae jinhone follow request bheja hai
      },
    }).select("username profilePicture email followerCount"); // Sirf important fields fetch kar rahe hain

    return response(
      res,
      200,
      "Users to follow back fetched successfully",
      userToFollowBack
    );
  } catch (error) {
    return response(res, 500, "Internal Server Error", error.message);
  }
};

// friend suggestion ke liye
const getAllUserForRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    //  Step 1: Find logged-in user's followers and followings
    const loggedInUser = await User.findById(loggedInUserId).select(
      "followers followings"
    );

    if (!loggedInUser) {
      return response(res, 404, "User Not Found");
    }

    // Step 2: Find users who are NOT in logged-in user's followers OR followings
    const userForFriendRequest = await User.find({
      _id: {
        $ne: loggedInUserId, //  Khud ko exclude karna hai
        $nin: [...loggedInUser.followers, ...loggedInUser.followings], //  Unko exclude jo already followers ya followings me hain
      },
    }).select("username profilePicture email followerCount"); //  Sirf important fields fetch kar rahe hain

    return response(
      res,
      200,
      "Users fetched successfully",
      userForFriendRequest
    );
  } catch (error) {
    return response(res, 500, "Internal Server Error", error.message);
  }
};

// api for get mutual friends

const getAllMutualFriends = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    //  Step 1: Logged-in user ka `followers` aur `followings` nikal rahe hain
    const loggedInUser = await User.findById(loggedInUserId)
      .select("followers followings") // Sirf followers aur followings ka data lenge
      .populate(
        "followings",
        "username profilePicture email followerCount followingCount"
      ) // Followings ka actual data la rahe hain
      .populate(
        "followers",
        "username profilePicture email followerCount followingCount"
      ); // Followers ka actual data la rahe hain

    //  Step 2: Agar user exist nahi karta to 404 response bhejo
    if (!loggedInUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    //  Step 3: Logged-in user ke `followings` ka ek `Set` bana rahe hain
    // (Taaki fast lookup ho sake)
    const followingUserId = new Set(
      loggedInUser.followings.map((user) => user._id.toString())
    );

    //  Step 4: `followers` me se sirf woh users lenge jo `followings` me bhi hain
    const mutualFriends = loggedInUser.followers.filter(
      (follower) => followingUserId.has(follower._id.toString()) // Agar follower bhi following list me hai to mutual friend hai
    );

    //  Step 5: Mutual Friends ka response bhejo
    return response(
      res,
      200,
      "mutal friends fetched successfully",
      mutualFriends
    );
  } catch (error) {
    //  Step 6: Agar koi error aaye to 500 response bhejo
    return response(res, 500, "Internal Server Error", error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const searchQuery = req.query.search || ""; // Get search input from query params

    const users = await User.find({
      username: { $regex: searchQuery, $options: "i" }, // Case-insensitive search
    }).select("username profilePicture email followerCount");

    return res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllRegisterUser=async (req,res)=>{
  try {
       const registeredUser=await User.find({});
       return response(
        res,
        200,
        "All registered User for Chatting ",
        registeredUser
      );
  } catch (error) {
    
  }
}


// check users authentication

const checkUserAuth = async (req, res) => {
  try {
    const userId = req?.user?.userId;
    
      if (!userId) {
        return response(
          res,
          404,
          "unauthorized please login before accessing the app"
        );
      }
      // user ke sensitive info ko fetch karo
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return response(res, 403, "user not found");
      }

      return response(
        res,
        201,
        "user retrive who are   allowed to use letsMeet",
        user
      );
    
  } catch (error) {
    return response(res, 500, "internal server error", error.message);
  }
};

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId)
    const loggedInUserId = req?.user?.userId;
    // user ke sensitive info ko fetch karo
    const userProfile = await User.findById(userId)
      .select("-password")
      .populate("bio")
      .populate("followers", "_id username profilePicture email")
      .populate("followings", "_id username profilePicture email")
      .exec();
    if (!userProfile) {
      return response(res, 403, "user not found");
    }
    const isOwner = loggedInUserId === userId;

    return response(res, 201, "user profile get succesfully", {
      profile: userProfile,
      isOwner,
    });
  } catch (error) {
    return response(res, 500, "internal server error", error.message);
  }
};
  
//ye mutual friends ka acutal api hai

// const getAllMutualFriends = async (req, res) => {
//   try {
//     // 🧑‍💻 Step 1: Logged-in user ka ID (maan lo U1 - Rohit)
//     const loggedInUserId = req.user.userId;  // => "U1"

//     // 🧐 Step 2: Rohit ke followings le lo (U2, U3, U4)
//     const loggedInUser = await User.findById(loggedInUserId).select("followings");

//     if (!loggedInUser) {
//       return res.status(404).json({ message: "User Not Found" });
//     }

//     // 🧾 Followings ko string me convert karo
//     const myFollowings = loggedInUser.followings.map((id) => id.toString());
//     // => ["U2", "U3", "U4"]

//     const mutualMap = new Map(); // 🗺️ Mutual friend counter

//     // 🔍 Step 3: Ab U2, U3, U4 ke followings nikaalo
//     const followingsData = await User.find({ _id: { $in: myFollowings } }).select("followings");

//     // 🤹‍♂️ Step 4: Har user ke followings par loop
//     followingsData.forEach((user) => {
//       user.followings.forEach((followedUserId) => {
//         const idStr = followedUserId.toString();

//         // ❌ Agar user khud hai (U1) ya Rohit ke already followings hai to skip karo
//         if (idStr === loggedInUserId || myFollowings.includes(idStr)) return;

//         // ➕ Map me count badhao
//         mutualMap.set(idStr, (mutualMap.get(idStr) || 0) + 1);
//       });
//     });

//     // 📦 mutualMap ab kuch aisa dikhega:
//     // {
//     //   "U5" => 2,  // (U2 & U3 dono ne follow kiya)
//     //   "U6" => 2,  // (U2 & U4 dono ne follow kiya)
//     //   "U7" => 1,  // (U3 ne follow kiya)
//     //   "U8" => 1   // (U4 ne follow kiya)
//     // }

//     const mutualFriendIds = Array.from(mutualMap.keys());
//     // => ["U5", "U6", "U7", "U8"]

//     // 📛 Step 5: Ab in mutuals ke full details fetch karo
//     const mutualFriends = await User.find({ _id: { $in: mutualFriendIds } }).select(
//       "username profilePicture email followerCount followingCount"
//     );

//     //  Success response
//     return response(res, 200, "Mutual friends fetched successfully", mutualFriends);

//   } catch (error) {
//     //  Error handling
//     return response(res, 500, "Internal Server Error", error.message);
//   }
// };

export {
  followUser,
  unFollowUser,
  deleteUserFromRequest,
  getAllFriendRequest,
  getAllUserForRequest,
  getAllMutualFriends,
  getAllUsers,
  checkUserAuth,
  getUserProfile,
  getAllRegisterUser,
};
