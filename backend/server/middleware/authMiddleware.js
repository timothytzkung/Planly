const jwt = require("jsonwebtoken");

exports.verifyToken = function (req, res, next) {
  // 1. get token from header
  const token = req.header("Authorization");

  // 2. check if token exists
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    // 3. verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret",
    );
    req.user = decoded // add entire decoded to request
    req.userId = decoded.id; // add user ID to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Verifies users via role in wristband
exports.verifyAdmin = function (req, res, next) {
  // empty check
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // check role
  if (req.user.role !== "admin") {
    // 403 => no permissions
    return res.status(403).json({ message: "Forbidden" })
  }

  // if user is admin, continue to router
  next();
}

