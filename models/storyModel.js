import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], required: true },
    createdAt: { type: Date, default: Date.now, expires: "24h" }, // Auto-delete after 24 hours
  },
  { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);
export default Story;