import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Real-time message ke liye
const users = {};

const getRecieverSocketId = (recieverId) => {
  return users[recieverId];
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Debug handshake query
  console.log(
    "Handshake Query:",
    socket.handshake.query
  );

  const userId = socket.handshake.query.userId;

  if (!userId) {
    console.log(
      "Warning: userId is missing in handshake query!"
    );
    return;
  }

  console.log(`User ID received: ${userId}`);

  users[userId] = socket.id;

  console.log("hello", users);

  io.emit(
    "getOnlineUsers",
    Object.keys(users)
  );

  socket.on("disconnect", () => {
    console.log(
      "A user disconnected:",
      socket.id
    );

    delete users[userId];

    io.emit(
      "getOnlineUsers",
      Object.keys(users)
    );
  });
});

export { app, io, server, getRecieverSocketId };