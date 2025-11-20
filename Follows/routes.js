import FollowsDao from "./dao.js";

export default function FollowRoutes(app) {
  const dao = FollowsDao();

  return app;
}

