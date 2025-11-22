import model from "./model.js";

export default function SavesDao() {
  const savePost = async (userId, postId) => {
    try {
      const existingSave = await model.findOne({ user: userId, post: postId });
      if (existingSave) {
        return existingSave;
      }
      const newSave = { _id: `${userId}-${postId}`, user: userId, post: postId };
      return await model.create(newSave);
    } catch (error) {
      throw error;
    }
  };

  const unsavePost = async (userId, postId) => {
    try {
      return await model.deleteOne({ user: userId, post: postId });
    } catch (error) {
      throw error;
    }
  };

  const findSavedPostsByUser = async (userId) => {
    try {
      const saves = await model.find({ user: userId }).populate({
        path: "post",
        populate: { path: "creator" },
      });
      return saves.map((save) => save.post).filter((post) => post !== null);
    } catch (error) {
      throw error;
    }
  };

  const checkIfPostSaved = async (userId, postId) => {
    try {
      const save = await model.findOne({ user: userId, post: postId });
      return save !== null;
    } catch (error) {
      throw error;
    }
  };

  return {
    savePost,
    unsavePost,
    findSavedPostsByUser,
    checkIfPostSaved,
  };
}

