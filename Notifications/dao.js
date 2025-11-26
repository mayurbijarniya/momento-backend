import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function NotificationsDao() {
  const createNotification = async (notificationData) => {
    try {
      const newNotification = { ...notificationData, _id: uuidv4() };
      return await model.create(newNotification);
    } catch (error) {
      throw error;
    }
  };

  const findNotificationsByUser = async (userId) => {
    try {
      return await model
        .find({ user: userId })
        .populate("actor")
        .populate("post")
        .populate("review")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  const findUnreadNotificationsByUser = async (userId) => {
    try {
      return await model
        .find({ user: userId, read: false })
        .populate("actor")
        .populate("post")
        .populate("review")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      return await model.updateOne(
        { _id: notificationId },
        { $set: { read: true, updatedAt: new Date() } }
      );
    } catch (error) {
      throw error;
    }
  };

  const markAllAsRead = async (userId) => {
    try {
      return await model.updateMany(
        { user: userId, read: false },
        { $set: { read: true, updatedAt: new Date() } }
      );
    } catch (error) {
      throw error;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      return await model.findByIdAndDelete(notificationId);
    } catch (error) {
      throw error;
    }
  };

  const countUnreadNotifications = async (userId) => {
    try {
      return await model.countDocuments({ user: userId, read: false });
    } catch (error) {
      throw error;
    }
  };

  return {
    createNotification,
    findNotificationsByUser,
    findUnreadNotificationsByUser,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    countUnreadNotifications,
  };
}

