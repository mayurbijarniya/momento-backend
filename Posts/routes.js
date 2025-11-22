import PostsDao from "./dao.js";
import upload from "../middleware/upload.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function PostRoutes(app) {
  const dao = PostsDao();

  const createPost = async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in to create a post" });
        return;
      }

      const serverUrl =
        process.env.SERVER_URL ||
        `http://localhost:${process.env.PORT || 4000}`;
      const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
      const imageId = req.file.filename;

      const tags = req.body.tags
        ? req.body.tags.replace(/ /g, "").split(",").filter((tag) => tag)
        : [];

      const postData = {
        creator: currentUser._id,
        caption: req.body.caption || "",
        imageUrl,
        imageId,
        location: req.body.location || "",
        tags,
        likes: [],
      };

      const newPost = await dao.createPost(postData);
      const populatedPost = await dao.findPostById(newPost._id);
      res.json(populatedPost);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  };
  app.post(
    "/api/posts",
    (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res
                .status(400)
                .json({ error: "File too large. Maximum size is 5MB." });
            }
            return res.status(400).json({ error: err.message });
          }
          return res
            .status(400)
            .json({ error: err.message || "File upload error" });
        }
        next();
      });
    },
    createPost
  );

  const getRecentPosts = async (req, res) => {
    try {
      const { limit, skip } = req.query;
      const limitNum = limit ? parseInt(limit) : undefined;
      const skipNum = skip ? parseInt(skip) : 0;
      let posts = await dao.findAllPosts();
      if (skipNum > 0) {
        posts = posts.slice(skipNum);
      }
      if (limitNum) {
        posts = posts.slice(0, limitNum);
      }
      res.json({ documents: posts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  };
  app.get("/api/posts", getRecentPosts);

  const getPostById = async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await dao.findPostById(postId);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  };
  app.get("/api/posts/:postId", getPostById);

  const getUserPosts = async (req, res) => {
    try {
      const { userId } = req.params;
      const posts = await dao.findPostsByCreator(userId);
      res.json({ documents: posts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user posts" });
    }
  };
  app.get("/api/posts/user/:userId", getUserPosts);

  const updatePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      const existingPost = await dao.findPostById(postId);
      if (!existingPost) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      if (existingPost.creator._id !== currentUser._id) {
        res.status(403).json({ message: "You can only update your own posts" });
        return;
      }

      const postUpdates = { ...req.body };
      if (req.file) {
        const serverUrl =
          process.env.SERVER_URL ||
          `http://localhost:${process.env.PORT || 4000}`;
        postUpdates.imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
        postUpdates.imageId = req.file.filename;

        if (existingPost.imageId) {
          const oldImagePath = path.join(
            __dirname,
            "../uploads",
            existingPost.imageId
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      if (postUpdates.tags && typeof postUpdates.tags === "string") {
        postUpdates.tags = postUpdates.tags
          .replace(/ /g, "")
          .split(",")
          .filter((tag) => tag);
      }

      await dao.updatePost(postId, postUpdates);
      const updatedPost = await dao.findPostById(postId);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post" });
    }
  };
  app.put(
    "/api/posts/:postId",
    (req, res, next) => {
      upload.single("file")(req, res, (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
              return res
                .status(400)
                .json({ error: "File too large. Maximum size is 5MB." });
            }
            return res.status(400).json({ error: err.message });
          }
          return res
            .status(400)
            .json({ error: err.message || "File upload error" });
        }
        next();
      });
    },
    updatePost
  );

  const deletePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      const post = await dao.findPostById(postId);
      if (!post) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      if (post.creator._id !== currentUser._id) {
        res.status(403).json({ message: "You can only delete your own posts" });
        return;
      }

      if (post.imageId) {
        const imagePath = path.join(__dirname, "../uploads", post.imageId);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await dao.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  };
  app.delete("/api/posts/:postId", deletePost);

  const likePost = async (req, res) => {
    try {
      const { postId } = req.params;
      const { likesArray } = req.body;
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      if (!likesArray || !Array.isArray(likesArray)) {
        res.status(400).json({ error: "likesArray must be an array" });
        return;
      }

      const updatedPost = await dao.likePost(postId, likesArray);
      if (!updatedPost) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      const populatedPost = await dao.findPostById(updatedPost._id);
      if (!populatedPost) {
        res.status(404).json({ error: "Post not found after update" });
        return;
      }

      res.json(populatedPost);
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to like post" });
    }
  };
  app.put("/api/posts/:postId/like", likePost);

  const searchPosts = async (req, res) => {
    try {
      const { searchTerm } = req.query;
      if (!searchTerm) {
        res.status(400).json({ error: "Search term is required" });
        return;
      }
      const posts = await dao.searchPosts(searchTerm);
      res.json({ documents: posts });
    } catch (error) {
      res.status(500).json({ error: "Failed to search posts" });
    }
  };
  app.get("/api/posts/search", searchPosts);

  const getLikedPosts = async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      if (currentUser._id !== userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }

      const posts = await dao.findPostsLikedByUser(userId);
      res.json({ documents: posts });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch liked posts" });
    }
  };
  app.get("/api/posts/user/:userId/liked", getLikedPosts);

  return app;
}
