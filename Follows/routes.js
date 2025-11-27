import FollowsDao from "./dao.js";
import NotificationsDao from "../Notifications/dao.js";

export default function FollowRoutes(app) {
  const dao = FollowsDao();
  const notificationsDao = NotificationsDao();

  const followUser = async (req, res) => {
    try {
      const { followingId } = req.body;
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      if (currentUser._id === followingId) {
        res.status(400).json({ message: "Cannot follow yourself" });
        return;
      }

      const follow = await dao.followUser(currentUser._id, followingId);
      
      try {
        await notificationsDao.createNotification({
          user: followingId,
          actor: currentUser._id,
          type: "FOLLOW",
        });
      } catch (notifError) {
        console.error("Error creating follow notification:", notifError);
      }
      
      res.json(follow);
    } catch (error) {
      if (error.message === "Cannot follow yourself") {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ error: "Failed to follow user" });
      }
    }
  };
  app.post("/api/follows", followUser);

  const unfollowUser = async (req, res) => {
    try {
      const { followingId } = req.params;
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.status(401).json({ message: "You must be logged in" });
        return;
      }

      await dao.unfollowUser(currentUser._id, followingId);
      res.json({ message: "Unfollowed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to unfollow user" });
    }
  };
  app.delete("/api/follows/:followingId", unfollowUser);

  const getFollowers = async (req, res) => {
    try {
      const { userId } = req.params;
      const followers = await dao.findFollowers(userId);
      res.json(followers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch followers" });
    }
  };
  app.get("/api/follows/followers/:userId", getFollowers);

  const getFollowing = async (req, res) => {
    try {
      const { userId } = req.params;
      const following = await dao.findFollowing(userId);
      res.json(following);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch following" });
    }
  };
  app.get("/api/follows/following/:userId", getFollowing);

  return app;
}
