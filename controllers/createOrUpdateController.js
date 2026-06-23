import Bio from "../model/userBio.js";
import response from "../utils/responseHandler.js";
import User from "../model/userModel.js";
import { uploadFileToCloudinary } from "../config/cloudinary.js";

const createOrUpdateUserBio = async (req, res) => {
  try {
    const { userId } = req.params;
    // console.log(userId);

    const {
      bioText,
      liveIn,
      relationShip,
      workPlace,
      education,
      phone,
      homeTown,
    } = req.body;

    let bio = await Bio.findOneAndUpdate(
      { user: userId },
      { bioText, liveIn, relationShip, workPlace, education, phone, homeTown },
      { new: true, runValidators: true }
    );

    if (!bio) {
      bio = new Bio({
        user: userId,
        bioText,
        liveIn,
        relationShip,
        workPlace,
        education,
        phone,
        homeTown,
      });

      await bio.save();
      await User.findByIdAndUpdate(userId, { bio: bio._id });
    }

    return response(res, 200, "User bio created successfully", bio);
  } catch (error) {
    return response(res, 500, "internal server error", error.message);
  }
};

const updateCoverPhoto = async (req, res) => {
  try {
    const { userId } = req.params;
    const file = req.file;

    if (!file) {
      return response(res, 400, "No file uploaded");
    }

    const uploadResult = await uploadFileToCloudinary(file);
    const coverPhoto = uploadResult.secure_url;

    if (!coverPhoto) {
      return response(res, 400, "Failed to upload cover photo");
    }

    const updateResult = await User.updateOne(
      { _id: userId },
      { $set: { coverPhoto } }
    );

    if (updateResult.matchedCount === 0) {
      return response(res, 404, "User not found");
    }

    const updatedUser = await User.findById(userId);

    response(res, 200, "Cover Photo updated Successfully", updatedUser);
  } catch (error) {
    response(res, 500, "Internal server error", error.message);
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, dateOfBirth } = req.body;
    const file = req.file;
    let profilePicture = null; // Changed from const to let

    if (file) {
      const uploadResult = await uploadFileToCloudinary(file);
      profilePicture = uploadResult.secure_url;
    }

    const update = await User.updateOne(
      { _id: userId }, // Fixed incorrect query
      {
        $set: {
          username,
          dateOfBirth,
          ...(profilePicture && { profilePicture }), // Only update if profilePicture exists
        },
      }
    );

    const updateUser = await User.findById(userId);

    if (!updateUser) {
      return response(res, 404, "User not found with this id");
    }

    response(res, 200, "Profile updated successfully", updateUser);
  } catch (error) {
    response(res, 500, "Internal server error", error.message);
  }
};

export { createOrUpdateUserBio, updateUserProfile, updateCoverPhoto };
