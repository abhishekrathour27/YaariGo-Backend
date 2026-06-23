import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import stream from "stream";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFileToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const options = {
      resource_type: file.mimetype.startsWith("video")
        ? "video"
        : "image",
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Convert buffer to stream
    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);
    bufferStream.pipe(uploadStream);
  });
};

// Multer middleware
const multerMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1,
  },
});

export { multerMiddleware, uploadFileToCloudinary };