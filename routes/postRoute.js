import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { multerMiddleware } from "../config/cloudinary.js";
import {
  createPost,
  getAllPost,
  getPostByUserId,
  likePost,
  sharePost,
  addCommentToPost,
  getAllStory,
  createStory,
  deletePost,
  deleteStory,
} from "../controllers/postController.js";

const router = express.Router();

router.post(
  "/posts",
  authMiddleware,
  multerMiddleware.single("media"),
  createPost
);

router.delete(
  "/posts/:postId",
  authMiddleware,
  deletePost
);

router.get("/posts", authMiddleware, getAllPost);

router.get(
  "/posts/user/:userId",
  authMiddleware,
  getPostByUserId
);

router.post(
  "/posts/likes/:postId",
  authMiddleware,
  likePost
);

router.post(
  "/posts/comments/:postId",
  authMiddleware,
  addCommentToPost
);

router.post(
  "/posts/share/:postId",
  authMiddleware,
  sharePost
);

router.post(
  "/story",
  authMiddleware,
  multerMiddleware.single("media"),
  createStory
);

router.get("/story", authMiddleware, getAllStory);

router.delete(
  "/story/:storyId",
  authMiddleware,
  deleteStory
);

export default router;