import MessagesDao from "./dao.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_MODEL = "google/gemini-2.0-flash-001";

const SYSTEM_PROMPT = `You are Momento AI, the intelligent assistant for Momento social network.

YOUR ROLE: Help users grow their social media presence with creative captions, post ideas, and engagement tips.

RULES:
1. Keep responses SHORT (under 50 words) - this is a mobile chat
2. Be casual, friendly, and trendy
3. Use emojis sparingly but effectively
4. Skip formal greetings - dive right in
5. For caption requests, give 2-3 options
6. Be encouraging and positive`;

export default function MessageRoutes(app) {
  const dao = MessagesDao();

  const sendMessage = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { content } = req.body;
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Message content required" });
      }

      const userMessage = await dao.createMessage({
        userId: currentUser._id,
        role: "user",
        content: content.trim(),
      });

      const history = await dao.findMessagesByUser(currentUser._id);
      const recentHistory = history.slice(-10);

      const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...recentHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      const aiResponse = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages,
          max_tokens: 150,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error("AI service unavailable");
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices[0]?.message?.content || 
        "Sorry, I couldn't generate a response. Try again!";

      const assistantMessage = await dao.createMessage({
        userId: currentUser._id,
        role: "assistant",
        content: aiContent,
      });

      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to process message. Please try again." 
      });
    }
  };
  app.post("/api/messages/chat", sendMessage);

  const getMessages = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const messages = await dao.findMessagesByUser(currentUser._id);
      res.json({ messages });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  };
  app.get("/api/messages", getMessages);

  const updateFeedback = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { messageId } = req.params;
      const { feedback } = req.body;

      if (!["up", "down", null].includes(feedback)) {
        return res.status(400).json({ message: "Invalid feedback value" });
      }

      const updated = await dao.updateMessageFeedback(messageId, feedback);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update feedback" });
    }
  };
  app.put("/api/messages/:messageId/feedback", updateFeedback);

  const clearMessages = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        return res.status(401).json({ message: "Authentication required" });
      }

      await dao.deleteMessagesByUser(currentUser._id);
      res.json({ message: "Conversation cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear conversation" });
    }
  };
  app.delete("/api/messages", clearMessages);

  return app;
}
