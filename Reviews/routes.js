import ReviewsDao from "./dao.js";

export default function ReviewRoutes(app) {
  const dao = ReviewsDao();

  return app;
}

