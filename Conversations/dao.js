import model from "./model.js";
import { v4 as uuidv4 } from "uuid";

export default function ConversationsDao() {
  const createMessage = async (messageData) => {
    try {
      const newMessage = { ...messageData, _id: uuidv4() };
      return await model.create(newMessage);
    } catch (error) {
      throw error;
    }
  };

  const findConversation = async (userId1, userId2) => {
    try {
      return await model
        .find({
          $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
          ],
        })
        .sort({ createdAt: 1 });
    } catch (error) {
      throw error;
    }
  };

  const getConversationPartners = async (userId) => {
    try {
      const messages = await model.find({
        $or: [
          { senderId: userId },
          { receiverId: userId },
        ],
      });

      // Get unique user IDs that the current user has conversed with
      const partnerIds = new Set();
      messages.forEach((message) => {
        if (message.senderId === userId) {
          partnerIds.add(message.receiverId);
        } else {
          partnerIds.add(message.senderId);
        }
      });

      return Array.from(partnerIds);
    } catch (error) {
      throw error;
    }
  };

  const getUnreadMessageCount = async (userId) => {
    try {
      // Find all unread messages where current user is the receiver
      const messages = await model.find({
        receiverId: userId,
        senderId: { $ne: userId },
        read: false,
      });

      // Get unique sender IDs (users who have sent unread messages to current user)
      const senderIds = new Set();
      messages.forEach((message) => {
        senderIds.add(message.senderId);
      });

      return senderIds.size;
    } catch (error) {
      throw error;
    }
  };

  const markMessagesAsRead = async (userId1, userId2) => {
    try {
      // Mark all messages from userId2 to userId1 as read
      await model.updateMany(
        {
          senderId: userId2,
          receiverId: userId1,
          read: false,
        },
        {
          $set: { read: true },
        }
      );
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  return {
    createMessage,
    findConversation,
    getConversationPartners,
    getUnreadMessageCount,
    markMessagesAsRead,
  };
}
