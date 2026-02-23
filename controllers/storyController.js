import { uploadFileToCloudinary } from "../config/cloudinary.js";
import Story from "../models/storyModal.js";
import response from "../utils/responseHandler.js";

export const createStory = async (req, res) => {
  try {
    const userID = req.user.userID;
    const file = req.file;

    if (!file) {
      response(res, 404, "Provide a file to create a story");
    }

    let mediaUrl = null;
    let mediaType = null;

    if (file) {
      const uploadResult = await uploadFileToCloudinary(file);
      console.log("upload result", uploadResult);
      mediaUrl = uploadResult?.secure_url;
      mediaType = file.mimetype.startsWith("video") ? "video" : "image";
    }

    const newStory = new Story({
      user: userID,
      mediaUrl,
      mediaType,
    });

    await newStory.save();

    return response(res, 200, "story created successfully", newStory);
  } catch (error) {
    return response(res, 500, "Internal error", error.message);
  }
};
