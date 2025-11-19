import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    _id: String,
    user: { type: String, ref: "UserModel", required: true },
    post: { type: String, ref: "PostModel" },
    externalContentId: String,
    review: String,
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "reviews" }
);

export default reviewSchema;

