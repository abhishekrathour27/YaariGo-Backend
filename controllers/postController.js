import { uploadFileToCloudinary } from "../config/cloudinary.js";
import Post from "../model/postModel.js";
import Story from "../model/storyModel.js";
import response from "../utils/responseHandler.js";
import Notification from "../model/notification.js";
import User from "../model/userModel.js";

const createPost = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("this is my userid", userId);

    const { content } = req.body;
    const file = req.file;

    let mediaUrl = null;
    let mediaType = null;

    if (file) {
      const uploadResult = await uploadFileToCloudinary(file);
      mediaUrl = uploadResult?.secure_url;
      mediaType = file.mimetype.startsWith("video")
        ? "video"
        : "image";
    }

    const newPost = new Post({
      user: userId,
      content,
      mediaUrl,
      mediaType,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
    });

    await newPost.save();

    return response(
      res,
      201,
      "Post created succesfully",
      newPost
    );
  } catch (error) {
    console.log("error creating the post", error);
    return response(
      res,
      500,
      "Internal server error",
      error.message
    );
  }
};

const deletePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Post Not Found");
    }

    if (post.user.toString() !== userId) {
      return response(
        res,
        403,
        "You are not authorized to delete this post"
      );
    }

    await Post.findByIdAndDelete(postId);

    return response(
      res,
      200,
      "Post deleted successfully"
    );
  } catch (error) {
    console.log("error deleting post", error);
    return response(
      res,
      500,
      "Internal server error",
      error.message
    );
  }
};

const createStory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const file = req.file;

    if (!file) {
      return response(
        res,
        400,
        "file is required to create a story"
      );
    }

    let mediaUrl = null;
    let mediaType = null;

    if (file) {
      const uploadResult = await uploadFileToCloudinary(file);
      mediaUrl = uploadResult?.secure_url;
      mediaType = file.mimetype.startsWith("video")
        ? "video"
        : "image";
    }

    const newStory = new Story({
      user: userId,
      mediaUrl,
      mediaType,
    });

    await newStory.save();

    return response(
      res,
      201,
      "story created succesfully",
      newStory
    );
  } catch (error) {
    console.log("error creating the story", error);
    return response(
      res,
      500,
      "Internal server error",
      error.message
    );
  }
};

const getAllStory = async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user.userId).select("friends");
    const friendIds = loggedInUser ? loggedInUser.friends : [];

    const story = await Story.find({
      user: { $in: [req.user.userId, ...friendIds] }
    })
      .sort({ createdAt: -1 })
      .populate(
        "user",
        "_id username profilePicture email"
      );

    return response(
      res,
      201,
      "story fetched successfuly",
      story
    );
  } catch (error) {
    console.log("error getting story", error);
    return response(
      res,
      500,
      "internal server error",
      error.message
    );
  }
};

const deleteStory = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user.userId;

  try {
    const story = await Story.findById(storyId);

    if (!story) {
      return response(res, 404, "Story Not Found");
    }

    if (story.user.toString() !== userId) {
      return response(
        res,
        403,
        "You are not authorized to delete this story"
      );
    }

    await Story.findByIdAndDelete(storyId);

    return response(
      res,
      200,
      "Story deleted successfully"
    );
  } catch (error) {
    console.log("error deleting story", error);
    return response(
      res,
      500,
      "Internal server error",
      error.message
    );
  }
};

const getAllPost = async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user.userId).select("friends");
    const friendIds = loggedInUser ? loggedInUser.friends : [];

    const posts = await Post.find({
      user: { $in: [req.user.userId, ...friendIds] }
    })
      .sort({ createdAt: -1 })
      .populate(
        "user",
        "_id username profilePicture email"
      )
      .populate({
        path: "comments.user",
        select: "username profilePicture",
      });

    return response(
      res,
      201,
      "posts fetched successfuly",
      posts
    );
  } catch (error) {
    console.log("error getting posts", error);
    return response(
      res,
      500,
      "internal server error",
      error.message
    );
  }
};

const getPostByUserId = async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.userId;

  try {
    if (!userId) {
      return response(
        res,
        400,
        "user id is required to get user post"
      );
    }

    if (userId !== currentUserId) {
      const targetUser = await User.findById(userId).select("friends");
      if (!targetUser || !targetUser.friends.includes(currentUserId)) {
        return response(
          res,
          403,
          "You are not friends with this user to view their posts"
        );
      }
    }

    const posts = await Post.find({
      user: userId,
    })
      .sort({ createdAt: -1 })
      .populate(
        "user",
        "_id username profilePicture email"
      )
      .populate({
        path: "comments.user",
        select: "username profilePicture",
      });

    return response(
      res,
      201,
      "posts fetched successfuly",
      posts
    );
  } catch (error) {
    console.log("error getting posts", error);
    return response(
      res,
      500,
      "internal server error",
      error.message
    );
  }
};

const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Post Not Found");
    }

    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      post.likeCount = Math.max(
        0,
        post.likeCount - 1
      );
    } else {
      post.likes.push(userId);
      post.likeCount += 1;
    }

    const updatedPost = await post.save();
    await updatedPost.populate("user", "_id username profilePicture email");
    await updatedPost.populate({
      path: "comments.user",
      select: "username profilePicture",
    });

    // Create notification if someone else likes the post
    if (!hasLiked && post.user.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "like",
        message: "liked your post"
      });
    }

    return response(
      res,
      201,
      hasLiked ? "Post unliked" : "post liked",
      updatedPost
    );
  } catch (error) {
    console.log("error", error);
    return response(
      res,
      500,
      "internal server error",
      error.message
    );
  }
};

const addCommentToPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;
  const { text } = req.body;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Post Not Found");
    }

    post.comments.push({
      user: userId,
      text,
    });

    post.commentCount += 1;

    await post.save();
    await post.populate("user", "_id username profilePicture email");
    await post.populate({
      path: "comments.user",
      select: "username profilePicture",
    });

    // Create notification if someone else comments on the post
    if (post.user.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "comment",
        message: "commented on your post",
        content: text
      });
    }

    return response(
      res,
      201,
      "Comments added successfully",
      post
    );
  } catch (error) {
    console.log("error", error);
    return response(
      res,
      500,
      "internal server error",
      error.message
    );
  }
};

const sharePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return response(res, 404, "Post Not Found");
    }

    const hasUserShared = post.share.includes(userId);

    if (!hasUserShared) {
      post.share.push(userId);
    }

    post.shareCount += 1;

    await post.save();
    await post.populate("user", "_id username profilePicture email");
    await post.populate({
      path: "comments.user",
      select: "username profilePicture",
    });

    return response(
      res,
      201,
      "post shared successfully",
      post
    );
  } catch (error) {
    console.log("error", error);
    return response(
      res,
      500,
      "internal server error",
      error.message
    );
  }
};

export {
  createPost,
  getAllPost,
  getPostByUserId,
  likePost,
  addCommentToPost,
  sharePost,
  createStory,
  getAllStory,
  deletePost,
  deleteStory,
};