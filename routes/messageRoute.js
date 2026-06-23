import express from "express";
import {
  sendMessage,
  getMessages,
  deleteForEveryOne,
  deleteForMe,
} from "../controllers/messsageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send/:id", authMiddleware, sendMessage);
router.get("/get/:id", authMiddleware, getMessages);

router.post("/deleteForMe", authMiddleware, deleteForMe);
router.post(
  "/deleteForEveryOne",
  authMiddleware,
  deleteForEveryOne
);

export default router;