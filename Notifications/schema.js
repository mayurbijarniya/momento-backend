import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    _id: String,
    user: { type: String, ref: "UserModel", required: true }, // User who receives the notification
    actor: { type: String, ref: "UserModel", required: true }, // User who performed the action
    type: {
      type: String,
      enum: ["LIKE", "FOLLOW", "REVIEW", "COMMENT"],
      required: true,
    },
    post: { type: String, ref: "PostModel" }, // Post related to the notification (for LIKE, REVIEW)
    review: { type: String, ref: "ReviewModel" }, // Review related to the notification
    externalContentId: String, // For reviews on external content
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "notifications" }
);

export default notificationSchema;

