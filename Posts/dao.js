import model from "./model.js";
import ReviewsModel from "../Reviews/model.js";
import { v4 as uuidv4 } from "uuid";

export default function PostsDao() {
  const createPost = async (post) => {
    try {
      const newPost = { ...post, _id: uuidv4() };
      return await model.create(newPost);
    } catch (error) {
      throw error;
    }
  };

  const findAllPosts = async (sortBy = "latest") => {
    try {
      let sortQuery = { createdAt: -1 };
      
      if (sortBy === "mostLiked") {
        sortQuery = { likesCount: -1, createdAt: -1 };
      } else if (sortBy === "mostReviewed") {
        sortQuery = { reviewsCount: -1, createdAt: -1 };
      } else if (sortBy === "latest") {
        sortQuery = { createdAt: -1 };
      } else if (sortBy === "oldest") {
        sortQuery = { createdAt: 1 };
      }
      
      const posts = await model.find().populate("creator", "-imageData").select("-imageData");
      
      if (sortBy === "mostLiked") {
        return posts.sort((a, b) => {
          const aLikes = (a.likes || []).length;
          const bLikes = (b.likes || []).length;
          if (aLikes !== bLikes) {
            return bLikes - aLikes;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }
      
      if (sortBy === "mostReviewed") {
        const postsWithReviews = await Promise.all(
          posts.map(async (post) => {
            const reviewsCount = await ReviewsModel.countDocuments({ post: post._id });
            return { ...post.toObject(), reviewsCount };
          })
        );
        return postsWithReviews.sort((a, b) => {
          if (a.reviewsCount !== b.reviewsCount) {
            return b.reviewsCount - a.reviewsCount;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      }
      
      return posts.sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    } catch (error) {
      throw error;
    }
  };

  const findPostById = async (postId) => {
    try {
      return await model.findById(postId).populate("creator", "-imageData").select("-imageData");
    } catch (error) {
      throw error;
    }
  };

  const findPostsByCreator = async (userId) => {
    try {
      return await model.find({ creator: userId }).populate("creator", "-imageData").select("-imageData").sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  const updatePost = async (postId, postUpdates) => {
    try {
      const updatedPost = { ...postUpdates, updatedAt: new Date() };
      return await model.updateOne({ _id: postId }, { $set: updatedPost });
    } catch (error) {
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      return await model.findByIdAndDelete(postId);
    } catch (error) {
      throw error;
    }
  };

  const likePost = async (postId, likesArray) => {
    try {
      if (!Array.isArray(likesArray)) {
        throw new Error("likesArray must be an array");
      }
      
      const result = await model.updateOne(
        { _id: postId },
        { 
          $set: { 
            likes: likesArray,
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error("Post not found");
      }
      
      const updatedPost = await model.findOne({ _id: postId });
      return updatedPost;
    } catch (error) {
      throw error;
    }
  };

  const searchPosts = async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim() === "") {
        return [];
      }
      const regex = new RegExp(searchTerm.trim(), "i");
      return await model
        .find({
          $or: [
            { caption: { $regex: regex } },
            { location: { $regex: regex } },
            { tags: regex },
          ],
        })
        .populate("creator", "-imageData")
        .select("-imageData")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  const findPostsLikedByUser = async (userId) => {
    try {
      return await model
        .find({ likes: userId })
        .populate("creator", "-imageData")
        .select("-imageData")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  const findPostByImageId = async (imageId) => {
    try {
      return await model.findOne({ imageId });
    } catch (error) {
      throw error;
    }
  };

  return {
    createPost,
    findAllPosts,
    findPostById,
    findPostsByCreator,
    updatePost,
    deletePost,
    likePost,
    searchPosts,
    findPostsLikedByUser,
    findPostByImageId,
  };
}

