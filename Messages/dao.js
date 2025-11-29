import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function MessagesDao() {
  const createMessage = async (messageData) => {
    try {
      const newMessage = { ...messageData, _id: uuidv4() };
      return await model.create(newMessage);
    } catch (error) {
      throw error;
    }
  };

  const findMessagesByUser = async (userId) => {
    try {
      return await model.find({ userId }).sort({ createdAt: 1 });
    } catch (error) {
      throw error;
    }
  };

  const updateMessageFeedback = async (messageId, feedback) => {
    try {
      return await model.findByIdAndUpdate(
        messageId,
        { feedback },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  };

  const deleteMessagesByUser = async (userId) => {
    try {
      return await model.deleteMany({ userId });
    } catch (error) {
      throw error;
    }
  };

  return {
    createMessage,
    findMessagesByUser,
    updateMessageFeedback,
    deleteMessagesByUser,
  };
}
