import multer from "multer";
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
import cloudinary from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const options = {
      resource_type: file.mimetype.startsWith("video") ? "video" : "image",
    };

    // Use file.buffer for memory storage instead of file.path
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );

    // Convert buffer to stream for cloudinary
    const stream = require("stream");
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

// Multer middleware for file uploads (memory storage for serverless compatibility)
export const multerMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
});
