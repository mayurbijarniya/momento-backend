export const requireAuth = (req, res, next) => {
  const currentUser = req.session["currentUser"];
  if (!currentUser) {
    res.status(401).json({ message: "Unauthorized. Please sign in." });
    return;
  }
  next();
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.status(401).json({ message: "Unauthorized. Please sign in." });
      return;
    }
    if (!roles.includes(currentUser.role)) {
      res.status(403).json({ message: "Forbidden. Insufficient permissions." });
      return;
    }
    next();
  };
};

