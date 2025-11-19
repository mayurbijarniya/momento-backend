import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function ReviewsDao() {
  const createReview = async (review) => {
    try {
      const newReview = { ...review, _id: uuidv4() };
      return await model.create(newReview);
    } catch (error) {
      console.error("Error in createReview:", error);
      throw error;
    }
  };

  const findReviewsByPost = async (postId) => {
    try {
      return await model.find({ post: postId }).populate("user").sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error in findReviewsByPost:", error);
      throw error;
    }
  };

  const findReviewsByExternalContent = async (externalContentId) => {
    try {
      return await model.find({ externalContentId: externalContentId }).populate("user").sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error in findReviewsByExternalContent:", error);
      throw error;
    }
  };

  const findReviewById = async (reviewId) => {
    try {
      return await model.findById(reviewId).populate("user");
    } catch (error) {
      console.error("Error in findReviewById:", error);
      throw error;
    }
  };

  const updateReview = async (reviewId, reviewUpdates) => {
    try {
      const updatedReview = { ...reviewUpdates, updatedAt: new Date() };
      return await model.updateOne({ _id: reviewId }, { $set: updatedReview });
    } catch (error) {
      console.error("Error in updateReview:", error);
      throw error;
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      return await model.findByIdAndDelete(reviewId);
    } catch (error) {
      console.error("Error in deleteReview:", error);
      throw error;
    }
  };

  return {
    createReview,
    findReviewsByPost,
    findReviewsByExternalContent,
    findReviewById,
    updateReview,
    deleteReview,
  };
}

