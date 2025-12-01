import MessagesDao from "./dao.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash-lite:online";
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

const SYSTEM_PROMPT = `You are Momento AI, the intelligent assistant for Momento social network.

YOUR ROLE: Help users grow their social media presence with creative captions, post ideas, and engagement tips.

RULES:
1. Keep responses SHORT (under 50 words) - this is a mobile chat
2. Be casual, friendly, and trendy
3. Use emojis sparingly but effectively
4. Skip formal greetings - dive right in
5. For caption requests, give 2-3 options
6. Be encouraging and positive`;

const isImageGenerationRequest = (content) => {
  const lowerContent = content.toLowerCase().trim();
  const imageKeywords = [
    "create an image",
    "generate an image",
    "make an image",
    "draw an image",
    "create image",
    "generate image",
    "make image",
    "draw image",
    "create a picture",
    "generate a picture",
    "make a picture",
    "create picture",
    "generate picture",
    "make picture",
    "create the image",
    "generate the image",
    "make the image",
    "draw the image",
  ];
  return imageKeywords.some((keyword) => {
    return lowerContent.startsWith(keyword) || lowerContent.includes(keyword);
  });
};

const extractImagePrompt = (content) => {
  const lowerContent = content.toLowerCase();
  const prefixes = [
    "create an image of",
    "generate an image of",
    "make an image of",
    "draw an image of",
    "create the image of",
    "generate the image of",
    "make the image of",
    "draw the image of",
    "create image of",
    "generate image of",
    "make image of",
    "draw image of",
    "create a picture of",
    "generate a picture of",
    "make a picture of",
    "create picture of",
    "generate picture of",
    "make picture of",
  ];

  let prompt = content;
  for (const prefix of prefixes) {
    if (lowerContent.includes(prefix)) {
      prompt = content
        .substring(content.toLowerCase().indexOf(prefix) + prefix.length)
        .trim();
      break;
    }
  }

  if (
    prompt === content &&
    lowerContent.includes("image") &&
    lowerContent.includes("of")
  ) {
    const ofIndex = lowerContent.indexOf("of");
    if (ofIndex !== -1) {
      prompt = content.substring(ofIndex + 2).trim();
    }
  }

  return prompt || content;
};

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

      const trimmedContent = content.trim();
      const userMessage = await dao.createMessage({
        userId: currentUser._id,
        role: "user",
        content: trimmedContent,
      });

      if (isImageGenerationRequest(trimmedContent)) {
        const imagePrompt = extractImagePrompt(trimmedContent);

        try {
          const imageResponse = await fetch(OPENROUTER_IMAGE_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
              "X-Title": "Momento AI Image Generation",
            },
            body: JSON.stringify({
              model: IMAGE_MODEL,
              messages: [
                {
                  role: "user",
                  content: `Generate an image of: ${imagePrompt}`,
                },
              ],
              image_config: {
                aspect_ratio: "1:1",
              },
              modalities: ["image"],
            }),
          });

          if (!imageResponse.ok) {
            const errorData = await imageResponse.json().catch(() => ({}));
            throw new Error(
              errorData.error?.message ||
                errorData.message ||
                `Image generation failed: ${imageResponse.status}`
            );
          }

          const imageData = await imageResponse.json();

          if (imageData.error) {
            throw new Error(imageData.error.message || "API returned an error");
          }

          let imageUrl = null;

          const findBase64Image = (obj) => {
            if (!obj || typeof obj !== "object") return null;

            for (const [key, value] of Object.entries(obj)) {
              if (typeof value === "string") {
                if (value.startsWith("data:image/")) {
                  return value;
                }
                if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) {
                  return `data:image/png;base64,${value}`;
                }
              } else if (Array.isArray(value)) {
                for (let i = 0; i < value.length; i++) {
                  const result = findBase64Image(value[i]);
                  if (result) return result;
                }
              } else if (typeof value === "object" && value !== null) {
                const result = findBase64Image(value);
                if (result) return result;
              }
            }
            return null;
          };

          const foundBase64 = findBase64Image(imageData);
          if (foundBase64) {
            imageUrl = foundBase64;
          }

          if (!imageUrl && imageData.choices?.[0]?.message?.content) {
            const content = imageData.choices[0].message.content;

            if (Array.isArray(content)) {
              const inlineDataPart = content.find(
                (part) => part.inline_data || (part.type && part.inline_data)
              );

              if (inlineDataPart?.inline_data?.data) {
                const mimeType =
                  inlineDataPart.inline_data.mime_type || "image/png";
                imageUrl = `data:${mimeType};base64,${inlineDataPart.inline_data.data}`;
              }

              if (!imageUrl) {
                const imagePart = content.find(
                  (part) =>
                    part.type === "image" ||
                    part.type === "image_url" ||
                    part.image_url ||
                    part.image ||
                    part.inline_data
                );

                if (imagePart) {
                  if (imagePart.inline_data?.data) {
                    const mimeType =
                      imagePart.inline_data.mime_type || "image/png";
                    imageUrl = `data:${mimeType};base64,${imagePart.inline_data.data}`;
                  } else if (imagePart.image_url?.url) {
                    imageUrl = imagePart.image_url.url;
                  } else if (imagePart.image_url) {
                    imageUrl = imagePart.image_url;
                  } else if (imagePart.image) {
                    imageUrl = imagePart.image;
                  } else if (imagePart.url) {
                    imageUrl = imagePart.url;
                  } else if (imagePart.data) {
                    const mimeType = imagePart.mime_type || "image/png";
                    imageUrl = `data:${mimeType};base64,${imagePart.data}`;
                  }
                }
              }
            } else if (typeof content === "string") {
              const base64Match = content.match(
                /data:image\/[^;]+;base64,[^\s"']+/
              );
              if (base64Match) {
                imageUrl = base64Match[0];
              } else {
                const urlMatch = content.match(/https?:\/\/[^\s"']+/);
                if (urlMatch) {
                  imageUrl = urlMatch[0];
                }
              }
            }
          }

          if (!imageUrl && imageData.choices?.[0]?.message?.image_url) {
            imageUrl =
              typeof imageData.choices[0].message.image_url === "string"
                ? imageData.choices[0].message.image_url
                : imageData.choices[0].message.image_url.url;
          }

          if (!imageUrl && imageData.data && Array.isArray(imageData.data)) {
            const imageItem = imageData.data.find(
              (item) => item.url || item.b64_json
            );
            if (imageItem?.url) {
              imageUrl = imageItem.url;
            } else if (imageItem?.b64_json) {
              imageUrl = `data:image/png;base64,${imageItem.b64_json}`;
            }
          }

          if (
            !imageUrl &&
            imageData.images &&
            Array.isArray(imageData.images)
          ) {
            const imageItem = imageData.images[0];
            if (imageItem?.url) {
              imageUrl = imageItem.url;
            } else if (imageItem?.b64_json) {
              imageUrl = `data:image/png;base64,${imageItem.b64_json}`;
            } else if (imageItem?.data) {
              const mimeType = imageItem.mime_type || "image/png";
              imageUrl = `data:${mimeType};base64,${imageItem.data}`;
            }
          }

          if (
            !imageUrl &&
            imageData.candidates &&
            Array.isArray(imageData.candidates)
          ) {
            const candidate = imageData.candidates[0];
            if (candidate?.content?.parts) {
              const imagePart = candidate.content.parts.find(
                (part) => part.inline_data
              );
              if (imagePart?.inline_data?.data) {
                const mimeType = imagePart.inline_data.mime_type || "image/png";
                imageUrl = `data:${mimeType};base64,${imagePart.inline_data.data}`;
              }
            }
          }

          if (!imageUrl) {
            const deepSearch = (obj, depth = 0) => {
              if (depth > 10 || !obj || typeof obj !== "object") return null;

              if (obj.data && obj.mime_type) {
                return `data:${obj.mime_type};base64,${obj.data}`;
              }

              if (obj.inline_data && obj.inline_data.data) {
                const mimeType = obj.inline_data.mime_type || "image/png";
                return `data:${mimeType};base64,${obj.inline_data.data}`;
              }

              for (const value of Object.values(obj)) {
                if (Array.isArray(value)) {
                  for (const item of value) {
                    const result = deepSearch(item, depth + 1);
                    if (result) return result;
                  }
                } else if (typeof value === "object" && value !== null) {
                  const result = deepSearch(value, depth + 1);
                  if (result) return result;
                }
              }
              return null;
            };

            const deepResult = deepSearch(imageData);
            if (deepResult) {
              imageUrl = deepResult;
            }
          }

          if (!imageUrl) {
            const assistantMessage = await dao.createMessage({
              userId: currentUser._id,
              role: "assistant",
              content: "I couldn't generate the image. Please try again.",
            });

            return res.json({
              userMessage,
              assistantMessage,
            });
          }

          const assistantMessage = await dao.createMessage({
            userId: currentUser._id,
            role: "assistant",
            content: `Here's the image: ${imagePrompt}`,
            imageUrl: imageUrl,
          });

          return res.json({
            userMessage,
            assistantMessage,
          });
        } catch (error) {
          const assistantMessage = await dao.createMessage({
            userId: currentUser._id,
            role: "assistant",
            content:
              "I'm having trouble generating the image. Please try again.",
          });

          return res.json({
            userMessage,
            assistantMessage,
          });
        }
      }

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
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
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
      const aiContent =
        aiData.choices[0]?.message?.content ||
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
        message: "Failed to process message. Please try again.",
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
