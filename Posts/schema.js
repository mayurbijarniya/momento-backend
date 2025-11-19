import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    _id: String,
    creator: { type: String, ref: "UserModel", required: true },
    caption: String,
    imageUrl: String,
    imageId: String,
    location: String,
    tags: [String],
    likes: [{ type: String, ref: "UserModel" }],
    savedBy: [{ type: String, ref: "UserModel" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "posts" }
);

export default postSchema;

