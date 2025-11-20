import PostsDao from "./dao.js";

export default function PostRoutes(app) {
  const dao = PostsDao();

  return app;
}

