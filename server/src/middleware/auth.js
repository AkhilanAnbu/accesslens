export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.status(401).json({ error: "Please sign in to continue." });
}
