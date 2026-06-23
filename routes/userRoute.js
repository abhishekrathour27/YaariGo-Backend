import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  followUser,
  unFollowUser,
  deleteUserFromRequest,
  getAllMutualFriends,
  getAllFriendRequest,
  getAllUserForRequest,
  getAllUsers,
  getUserProfile,
  checkUserAuth,
  getAllRegisterUser,
} from "../controllers/userController.js";

import {
  createOrUpdateUserBio,
  updateCoverPhoto,
  updateUserProfile,
} from "../controllers/createOrUpdateController.js";

import { multerMiddleware } from "../config/cloudinary.js";

const router = express.Router();

router.post("/follow", authMiddleware, followUser);
router.post("/unfollow", authMiddleware, unFollowUser);
router.post(
  "/remove/friend-request",
  authMiddleware,
  deleteUserFromRequest
);

router.get(
  "/friend-request",
  authMiddleware,
  getAllFriendRequest
);

router.get(
  "/users-to-request",
  authMiddleware,
  getAllUserForRequest
);

router.get(
  "/mutual-friends",
  authMiddleware,
  getAllMutualFriends
);

router.get("/all-users", authMiddleware, getAllUsers);

router.get(
  "/registered-users",
  getAllRegisterUser
);

router.get(
  "/profile/:userId",
  authMiddleware,
  getUserProfile
);

router.get(
  "/check-auth",
  authMiddleware,
  checkUserAuth
);

// Create or update user bio
router.put(
  "/bio/:userId",
  authMiddleware,
  createOrUpdateUserBio
);

router.put(
  "/profile/:userId",
  multerMiddleware.single("profilePicture"),
  updateUserProfile
);

router.put(
  "/profile/cover-photo/:userId",
  multerMiddleware.single("coverPhoto"),
  updateCoverPhoto
);

export default router;