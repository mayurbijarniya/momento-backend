import model from "./model.js";
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

  const findAllPosts = async () => {
    try {
      return await model.find().populate("creator").sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  const findPostById = async (postId) => {
    try {
      return await model.findById(postId).populate("creator");
    } catch (error) {
      throw error;
    }
  };

  const findPostsByCreator = async (userId) => {
    try {
      return await model.find({ creator: userId }).populate("creator").sort({ createdAt: -1 });
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
        .populate("creator")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  const findPostsLikedByUser = async (userId) => {
    try {
      return await model
        .find({ likes: userId })
        .populate("creator")
        .sort({ createdAt: -1 });
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
  };
}

