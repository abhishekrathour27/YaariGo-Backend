import express from "express";
import {
  getAllNotifications,
  deleteNotification,
} from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/get-all-notification",
  authMiddleware,
  getAllNotifications
);

router.get(
  "/delete-notification/:id",
  authMiddleware,
  deleteNotification
);

export default router;