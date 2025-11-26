import NotificationsDao from "./dao.js";

export default function NotificationRoutes(app) {
  const dao = NotificationsDao();

  // Get all notifications for current user
  const getNotifications = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      const notifications = await dao.findNotificationsByUser(currentUser._id);
      res.json({ documents: notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  };
  app.get("/api/notifications", getNotifications);

  // Get unread notifications count
  const getUnreadCount = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      const count = await dao.countUnreadNotifications(currentUser._id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Failed to fetch unread count" });
    }
  };
  app.get("/api/notifications/unread-count", getUnreadCount);

  // Mark notification as read
  const markNotificationAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      await dao.markAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  };
  app.put("/api/notifications/:notificationId/read", markNotificationAsRead);

  // Mark all notifications as read
  const markAllAsRead = async (req, res) => {
    try {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      await dao.markAllAsRead(currentUser._id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ error: "Failed to mark all notifications as read" });
    }
  };
  app.put("/api/notifications/read-all", markAllAsRead);

  // Delete notification
  const deleteNotification = async (req, res) => {
    try {
      const { notificationId } = req.params;
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      await dao.deleteNotification(notificationId);
      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  };
  app.delete("/api/notifications/:notificationId", deleteNotification);

  return app;
}

