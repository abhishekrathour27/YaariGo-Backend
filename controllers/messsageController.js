import express from "express";
import response from "../utils/responseHandler.js";
import Message from "../model/messageModel.js";
import Conversation from "../model/conversationModel.js";
import mongoose from "mongoose";
import { io, getRecieverSocketId } from "../socketIO/server.js";

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.userId;

    if (!message) {
      return response(res, 400, "Message content is required");
    }

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
      });
      await conversation.save();
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    if (newMessage) {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    const receiverSocketId = getRecieverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    const senderSocketId = getRecieverSocketId(senderId);

    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSent", newMessage);
    }

    return response(res, 201, "Message sent successfully", newMessage);
  } catch (error) {
    // console.error("Error sending message:", error);
    return response(res, 500, "Internal Server Error");
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user.userId;

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, chatUser] },
    }).populate("messages");

    if (!conversation) {
      return response(res, 200, "No conversation found", []);
    }

    const filterdMessageDeletedByLoggedInUser =
      conversation.messages.filter(
        (msg) => !msg.deletedBy.includes(senderId)
      );

    const receiverSocketId = getRecieverSocketId(chatUser);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "messageUpdated",
        conversation.messages
      );
    }

    return response(
      res,
      200,
      "Messages retrieved successfully",
      filterdMessageDeletedByLoggedInUser
    );
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return response(res, 500, "Internal Server Error");
  }
};

const deleteForMe = async (req, res) => {
  const { messageId, userId } = req.body;

  if (
    ![messageId, userId].every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    )
  ) {
    return response(res, 400, "Invalid messageId or userId");
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return response(res, 404, "Message Not Found");
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { deletedBy: userId.toString() } },
      { new: true }
    );

    return response(
      res,
      200,
      "Message deleted for you successfully",
      updatedMessage
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return response(res, 500, "Failed to delete the message");
  }
};

const deleteForEveryOne = async (req, res) => {
  const { senderId, messageId } = req.body;

  if (
    ![senderId, messageId].every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    )
  ) {
    return response(res, 400, "Invalid messageId or senderId");
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return response(res, 404, "Message Not Found");
    }

    if (message.senderId.toString() !== senderId.toString()) {
      return response(res, 403, "Unauthorized action");
    }

    await Message.findByIdAndDelete(messageId);

    return response(res, 200, "Message deleted successfully");
  } catch (error) {
    console.error("Error deleting message:", error);
    return response(res, 500, "Failed to delete the message");
  }
};

export {
  sendMessage,
  getMessages,
  deleteForMe,
  deleteForEveryOne,
};