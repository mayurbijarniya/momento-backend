import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function UsersDao() {
  const createUser = async (user) => {
    try {
      const newUser = { ...user, _id: uuidv4() };
      return await model.create(newUser);
    } catch (error) {
      throw error;
    }
  };

  const findAllUsers = async () => {
    try {
      return await model.find();
    } catch (error) {
("Error in findAllUsers:", error);
      throw error;
    }
  };

  const findUserById = async (userId) => {
    try {
      return await model.findById(userId);
    } catch (error) {
("Error in findUserById:", error);
      throw error;
    }
  };

  const findUsersByPartialName = async (partialName) => {
    try {
      const regex = new RegExp(partialName, "i");
      return await model.find({
        $or: [{ name: { $regex: regex } }, { username: { $regex: regex } }],
      });
    } catch (error) {
("Error in findUsersByPartialName:", error);
      throw error;
    }
  };

  const findUsersByRole = async (role) => {
    try {
      return await model.find({ role: role });
    } catch (error) {
("Error in findUsersByRole:", error);
      throw error;
    }
  };

  const findUserByUsername = async (username) => {
    try {
      return await model.findOne({ username: username });
    } catch (error) {
("Error in findUserByUsername:", error);
      throw error;
    }
  };

  const findUserByEmail = async (email) => {
    try {
      return await model.findOne({ email: email });
    } catch (error) {
("Error in findUserByEmail:", error);
      throw error;
    }
  };

  const findUserByCredentials = async (username, password) => {
    try {
      return await model.findOne({ username: username, password: password });
    } catch (error) {
("Error in findUserByCredentials:", error);
      throw error;
    }
  };

  const findUserByEmailCredentials = async (email, password) => {
    try {
      return await model.findOne({ email: email, password: password });
    } catch (error) {
("Error in findUserByEmailCredentials:", error);
      throw error;
    }
  };

  const updateUser = async (userId, user) => {
    try {
      const updatedUser = { ...user, updatedAt: new Date() };
      return await model.updateOne({ _id: userId }, { $set: updatedUser });
    } catch (error) {
("Error in updateUser:", error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      return await model.findByIdAndDelete(userId);
    } catch (error) {
("Error in deleteUser:", error);
      throw error;
    }
  };

  return {
    createUser,
    findAllUsers,
    findUserById,
    findUserByUsername,
    findUserByEmail,
    findUserByCredentials,
    findUserByEmailCredentials,
    updateUser,
    deleteUser,
    findUsersByRole,
    findUsersByPartialName,
  };
}
