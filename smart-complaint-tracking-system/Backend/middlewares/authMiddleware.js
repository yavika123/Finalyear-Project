const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = (role) => async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // Fetch user details from DB

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // ✅ Assign user to req.user

    // Role-based access control
    if (role && user.role !== role) {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
