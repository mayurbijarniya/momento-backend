import UsersDao from "./dao.js";
import upload from "../middleware/upload.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { requireRole } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function UserRoutes(app) {
  const dao = UsersDao();

  const signup = async (req, res) => {
    try {
      const existingUser = await dao.findUserByUsername(req.body.username);
      if (existingUser) {
        res.status(400).json({ message: "Username already taken" });
        return;
      }
      const existingEmail = await dao.findUserByEmail(req.body.email);
      if (existingEmail) {
        res.status(400).json({ message: "Email already registered" });
        return;
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const userData = {
        ...req.body,
        password: hashedPassword,
      };
      const currentUser = await dao.createUser(userData);
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to sign up user" });
    }
  };
  app.post("/api/users/signup", signup);

  const signin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(400)
          .json({ message: "Email/Username and password are required" });
        return;
      }

      let currentUser = null;

      if (email.includes("@")) {
        currentUser = await dao.findUserByEmail(email);
      } else {
        currentUser = await dao.findUserByUsername(email);
      }

      if (!currentUser) {
        res
          .status(401)
          .json({ message: "Invalid credentials. Please try again." });
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        currentUser.password
      );

      if (isPasswordValid) {
        req.session["currentUser"] = currentUser;
        res.json(currentUser);
      } else {
        res
          .status(401)
          .json({ message: "Invalid credentials. Please try again." });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to sign in user" });
    }
  };
  app.post("/api/users/signin", signin);

  const signout = (req, res) => {
    try {
      req.session.destroy();
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ error: "Failed to sign out" });
    }
  };
  app.post("/api/users/signout", signout);

  const profile = (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(200).json(null);
        return;
      }
      res.json(currentUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  };
  app.post("/api/users/profile", profile);

  const findAllUsers = async (req, res) => {
    try {
      const { role, name } = req.query;
      if (role) {
        const users = await dao.findUsersByRole(role);
        res.json(users);
        return;
      }
      if (name) {
        const users = await dao.findUsersByPartialName(name);
        res.json(users);
        return;
      }
      const users = await dao.findAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  };
  app.get("/api/users", findAllUsers);

  const findUserById = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await dao.findUserById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  };
  app.get("/api/users/:userId", findUserById);

  const uploadProfileImage = async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const serverUrl =
        process.env.SERVER_URL ||
        `http://localhost:${process.env.PORT || 4000}`;
      const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
      const imageId = req.file.filename;

      res.json({
        imageUrl,
        imageId,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  };
  app.post(
    "/api/users/upload",
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
    uploadProfileImage
  );

  const updateUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const userUpdates = { ...req.body };

      if (userUpdates.password) {
        userUpdates.password = await bcrypt.hash(userUpdates.password, 10);
      }

      await dao.updateUser(userId, userUpdates);
      const updatedUser = await dao.findUserById(userId);
      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      const currentUser = req.session["currentUser"];
      if (currentUser && currentUser._id === userId) {
        req.session["currentUser"] = updatedUser;
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  };
  app.put("/api/users/:userId", updateUser);

  const createUser = async (req, res) => {
    try {
      const user = await dao.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  };
  app.post("/api/users", createUser);

  const deleteUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const currentUser = req.session["currentUser"];

      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      // Allow users to delete their own account, or admins to delete any account
      if (currentUser._id !== userId && currentUser.role !== "ADMIN") {
        res
          .status(403)
          .json({ message: "You can only delete your own account" });
        return;
      }

      // If user is deleting their own account, destroy session
      if (currentUser._id === userId) {
        req.session.destroy();
      }

      const status = await dao.deleteUser(userId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  };
  app.delete("/api/users/:userId", deleteUser);

  // Admin route: Get all users
  const getAllUsers = async (req, res) => {
    try {
      const users = await dao.findAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  };
  app.get("/api/admin/users", requireRole(["ADMIN"]), getAllUsers);

  return app;
}
