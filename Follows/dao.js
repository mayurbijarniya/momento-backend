import model from "./model.js";

export default function FollowsDao() {
  const followUser = async (followerId, followingId) => {
    try {
      if (followerId === followingId) {
        throw new Error("Cannot follow yourself");
      }
      const existingFollow = await model.findOne({
        follower: followerId,
        following: followingId,
      });
      if (existingFollow) {
        return existingFollow;
      }
      const newFollow = {
        _id: `${followerId}-${followingId}`,
        follower: followerId,
        following: followingId,
      };
      return await model.create(newFollow);
    } catch (error) {
      throw error;
    }
  };

  const unfollowUser = async (followerId, followingId) => {
    try {
      return await model.deleteOne({
        follower: followerId,
        following: followingId,
      });
    } catch (error) {
      throw error;
    }
  };

  const findFollowers = async (userId) => {
    try {
      const follows = await model.find({ following: userId }).populate("follower");
      return follows.map((follow) => follow.follower).filter((user) => user !== null);
    } catch (error) {
      throw error;
    }
  };

  const findFollowing = async (userId) => {
    try {
      const follows = await model.find({ follower: userId }).populate("following");
      return follows.map((follow) => follow.following).filter((user) => user !== null);
    } catch (error) {
      throw error;
    }
  };

  const checkIfFollowing = async (followerId, followingId) => {
    try {
      const follow = await model.findOne({
        follower: followerId,
        following: followingId,
      });
      return follow !== null;
    } catch (error) {
      throw error;
    }
  };

  return {
    followUser,
    unfollowUser,
    findFollowers,
    findFollowing,
    checkIfFollowing,
  };
}

