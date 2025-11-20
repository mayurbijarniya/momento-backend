import SavesDao from "./dao.js";

export default function SaveRoutes(app) {
  const dao = SavesDao();

  return app;
}

