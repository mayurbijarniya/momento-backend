import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function PostsDao() {
  const createPost = async (post) => {
    try {
      const newPost = { ...post, _id: uuidv4() };
      return await model.create(newPost);
    } catch (error) {
      console.error("Error in createPost:", error);
      throw error;
    }
  };

  const findAllPosts = async () => {
    try {
      return await model.find().populate("creator").sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error in findAllPosts:", error);
      throw error;
    }
  };

  const findPostById = async (postId) => {
    try {
      return await model.findById(postId).populate("creator");
    } catch (error) {
      console.error("Error in findPostById:", error);
      throw error;
    }
  };

  const findPostsByCreator = async (userId) => {
    try {
      return await model.find({ creator: userId }).populate("creator").sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error in findPostsByCreator:", error);
      throw error;
    }
  };

  const updatePost = async (postId, postUpdates) => {
    try {
      const updatedPost = { ...postUpdates, updatedAt: new Date() };
      return await model.updateOne({ _id: postId }, { $set: updatedPost });
    } catch (error) {
      console.error("Error in updatePost:", error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      return await model.findByIdAndDelete(postId);
    } catch (error) {
      console.error("Error in deletePost:", error);
      throw error;
    }
  };

  const likePost = async (postId, userId) => {
    try {
      const post = await model.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }
      const isLiked = post.likes.includes(userId);
      if (isLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
      } else {
        post.likes.push(userId);
      }
      await post.save();
      return post;
    } catch (error) {
      console.error("Error in likePost:", error);
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
  };
}

