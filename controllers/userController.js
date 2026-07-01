import User from "../model/userModel.js";
import response from "../utils/responseHandler.js";
import Notification from "../model/notification.js";
const followUser = async (req, res) => {
  // Request body se request bhejne wale / follow back karne wale user ka ID lena
  const { userIdToFollow } = req.body;
  // Jo user action perform kar raha hai uska ID (authentication middleware se)
  const userId = req.user?.userId;

  if (userId === userIdToFollow) {
    return response(res, 400, "You cannot request/friend yourself");
  }

  try {
    const userToFollow = await User.findById(userIdToFollow);
    const currentUser = await User.findById(userId);

    if (!userToFollow || !currentUser) {
      return response(res, 404, "User not found");
    }

    // Check if they are already friends
    if (currentUser.friends.includes(userIdToFollow)) {
      return response(res, 400, "You are already friends with this user");
    }

    // Check if there is already an active incoming friend request from userToFollow to currentUser
    if (currentUser.friendRequestsReceived.includes(userIdToFollow)) {
      // Accept the friend request!
      // Add each other to friends lists
      currentUser.friends.push(userIdToFollow);
      userToFollow.friends.push(userId);

      // Remove from pending request lists
      currentUser.friendRequestsReceived = currentUser.friendRequestsReceived.filter(
        (id) => id.toString() !== userIdToFollow
      );
      userToFollow.friendRequestsSent = userToFollow.friendRequestsSent.filter(
        (id) => id.toString() !== userId
      );

      // Update count
      currentUser.friendsCount = currentUser.friends.length;
      userToFollow.friendsCount = userToFollow.friends.length;

      // Save both
      await currentUser.save({ validateBeforeSave: false });
      await userToFollow.save({ validateBeforeSave: false });

      // Create accept notification
      await Notification.create({
        recipient: userIdToFollow,
        sender: userId,
        type: "friend_accept",
        message: "accepted your friend request",
      });

      return response(res, 200, "Friend request accepted successfully");
    }

    // Otherwise, check if we have already sent a request to them
    if (currentUser.friendRequestsSent.includes(userIdToFollow)) {
      return response(res, 400, "Friend request already sent");
    }

    // Send a new friend request
    currentUser.friendRequestsSent.push(userIdToFollow);
    userToFollow.friendRequestsReceived.push(userId);

    // Save both
    await currentUser.save({ validateBeforeSave: false });
    await userToFollow.save({ validateBeforeSave: false });

    // Create follow notification (for requests, type is friend_request)
    await Notification.create({
      recipient: userIdToFollow,
      sender: userId,
      type: "friend_request",
      message: "sent you a friend request",
    });

    return response(res, 200, "Friend request sent successfully");
  } catch (error) {
    return response(res, 500, "Internal server error", error.message);
  }
};

const unFollowUser = async (req, res) => {
  const { userIdToUnFollow } = req.body;
  const userId = req.user?.userId;

  if (userId === userIdToUnFollow) {
    return response(res, 400, "You are not allowed to unfriend yourself");
  }

  try {
    const userToUnFollow = await User.findById(userIdToUnFollow);
    const currentUser = await User.findById(userId);

    if (!userToUnFollow || !currentUser) {
      return response(res, 404, "User not found");
    }

    // If they are friends, remove friendship
    if (currentUser.friends.includes(userIdToUnFollow)) {
      currentUser.friends = currentUser.friends.filter(
        (id) => id.toString() !== userIdToUnFollow
      );
      userToUnFollow.friends = userToUnFollow.friends.filter(
        (id) => id.toString() !== userId
      );

      currentUser.friendsCount = Math.max(0, currentUser.friends.length);
      userToUnFollow.friendsCount = Math.max(0, userToUnFollow.friends.length);

      await currentUser.save({ validateBeforeSave: false });
      await userToUnFollow.save({ validateBeforeSave: false });

      return response(res, 200, "Unfriended user successfully");
    }

    // If there is a pending sent request, cancel/remove it
    if (currentUser.friendRequestsSent.includes(userIdToUnFollow)) {
      currentUser.friendRequestsSent = currentUser.friendRequestsSent.filter(
        (id) => id.toString() !== userIdToUnFollow
      );
      userToUnFollow.friendRequestsReceived = userToUnFollow.friendRequestsReceived.filter(
        (id) => id.toString() !== userId
      );

      await currentUser.save({ validateBeforeSave: false });
      await userToUnFollow.save({ validateBeforeSave: false });

      return response(res, 200, "Friend request cancelled successfully");
    }

    return response(res, 400, "No friendship or pending request exists with this user");
  } catch (error) {
    return response(res, 500, "Internal server error", error.message);
  }
};

const deleteUserFromRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId; // The user rejecting the request
    const { requestSenderId } = req.body; // The user who sent the friend request

    const requestSender = await User.findById(requestSenderId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!requestSender || !loggedInUser) {
      return response(res, 404, "User not found");
    }

    // Remove from pending lists
    loggedInUser.friendRequestsReceived = loggedInUser.friendRequestsReceived.filter(
      (user) => user.toString() !== requestSenderId
    );
    requestSender.friendRequestsSent = requestSender.friendRequestsSent.filter(
      (user) => user.toString() !== loggedInUserId
    );

    await loggedInUser.save({ validateBeforeSave: false });
    await requestSender.save({ validateBeforeSave: false });

    return response(
      res,
      200,
      `Friend Request From ${requestSender.username} deleted successfully`
    );
  } catch (error) {
    return response(res, 500, "Internal server error", error.message);
  }
};

const getAllFriendRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const loggedInUser = await User.findById(loggedInUserId).populate(
      "friendRequestsReceived",
      "username profilePicture email friendsCount"
    );

    if (!loggedInUser) {
      return response(res, 404, "User Not Found");
    }

    return response(
      res,
      200,
      "Friend requests fetched successfully",
      loggedInUser.friendRequestsReceived || []
    );
  } catch (error) {
    return response(res, 500, "Internal Server Error", error.message);
  }
};

const getAllUserForRequest = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const loggedInUser = await User.findById(loggedInUserId);

    if (!loggedInUser) {
      return response(res, 404, "User Not Found");
    }

    const excludedIds = [
      loggedInUserId,
      ...(loggedInUser.friends || []),
      ...(loggedInUser.friendRequestsSent || []),
      ...(loggedInUser.friendRequestsReceived || []),
    ];

    const userForFriendRequest = await User.find({
      _id: { $nin: excludedIds },
    }).select("username profilePicture email friendsCount");

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

const getAllMutualFriends = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId;

    const loggedInUser = await User.findById(loggedInUserId)
      .select("friends")
      .populate("friends", "username profilePicture email friendsCount");

    if (!loggedInUser) {
      return response(res, 404, "User Not Found");
    }

    return response(
      res,
      200,
      "mutual friends fetched successfully",
      loggedInUser.friends || []
    );
  } catch (error) {
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
      .populate("friends", "_id username profilePicture email friendsCount")
      .populate("friendRequestsReceived", "_id username profilePicture email friendsCount")
      .populate("friendRequestsSent", "_id username profilePicture email friendsCount")
      .exec();
    if (!userProfile) {
      return response(res, 403, "user not found");
    }
    const isOwner = loggedInUserId === userId;

    let friendshipStatus = "none";
    if (loggedInUserId) {
      if (loggedInUserId.toString() === userId.toString()) {
        friendshipStatus = "self";
      } else if (userProfile.friends.some((f) => f._id.toString() === loggedInUserId)) {
        friendshipStatus = "friends";
      } else if (userProfile.friendRequestsReceived.some((r) => r._id.toString() === loggedInUserId)) {
        friendshipStatus = "sent_pending";
      } else if (userProfile.friendRequestsSent.some((r) => r._id.toString() === loggedInUserId)) {
        friendshipStatus = "received_pending";
      }
    }

    return response(res, 201, "user profile get succesfully", {
      profile: userProfile,
      isOwner,
      friendshipStatus,
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
