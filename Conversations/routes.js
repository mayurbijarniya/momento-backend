import ConversationsDao from "./dao.js";

export default function ConversationRoutes(app) {
  const dao = ConversationsDao();

  const sendMessage = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { receiverId, content } = req.body;
      if (!receiverId || !content || !content.trim()) {
        return res.status(400).json({ message: "Receiver and content required" });
      }

      const message = await dao.createMessage({
        senderId: currentUser._id,
        receiverId,
        content: content.trim(),
      });

      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  };
  app.post("/api/conversations/send", sendMessage);

  const getConversation = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const messages = await dao.findConversation(currentUser._id, userId);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  };
  app.get("/api/conversations/:userId", getConversation);

  const getConversationPartners = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const partnerIds = await dao.getConversationPartners(currentUser._id);
      res.json({ partnerIds });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation partners" });
    }
  };
  app.get("/api/conversations", getConversationPartners);

  return app;
}
