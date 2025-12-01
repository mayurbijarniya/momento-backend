import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    _id: String,
    userId: { type: String, ref: "UserModel", required: true },
    role: { 
      type: String, 
      enum: ["user", "assistant"], 
      required: true 
    },
    content: { type: String, required: true },
    imageUrl: { type: String, default: null },
    feedback: { 
      type: String, 
      enum: ["up", "down", null], 
      default: null 
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "messages" }
);

export default messageSchema;
