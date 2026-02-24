import { uploadFileToCloudinary } from "../config/cloudinary.js";
import Story from "../models/storyModel.js";
import response from "../utils/responseHandler.js";

export const createStory = async (req, res) => {
  try {
    const userID = req.user;

    const file = req.file;
    console.log("UserId", userID);

    if (!file) {
      return response(res, 400, "Provide a file to create a story");
    }

    console.log("file received");

    const uploadResult = await uploadFileToCloudinary(file);

    console.log("uploaded");

    const newStory = new Story({
      user: userID,

      mediaUrl: uploadResult.secure_url,

      mediaType: file.mimetype.startsWith("video") ? "video" : "image",
    });

    await newStory.save();

    return response(res, 200, "story created successfully", newStory);
  } catch (error) {
    console.log(error);
    return response(res, 500, "Internal error", error.message);
  }
};

export const getAllStory = async (req, res) => {
  try {
    const last24Hour = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const story = await Story.find({
      createdAt: {
        $gte: last24Hour,
      },
    })
      .sort({ createdAt: -1 })

      .populate("user", "username profilePicture");

    if (!story.length) {
      return response(res, 404, "No stories found");
    }

    return response(res, 200, "story fetched successfully", story);
  } catch (error) {
    console.log(error);

    return response(res, 500, "internal server error", error.message);
  }
};
