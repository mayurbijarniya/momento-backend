import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    _id: String,
    follower: { type: String, ref: "UserModel", required: true },
    following: { type: String, ref: "UserModel", required: true },
    followedAt: { type: Date, default: Date.now },
  },
  { collection: "follows" }
);

export default followSchema;

