const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/*
=======================================================
🔐 PROTECT MIDDLEWARE
=======================================================
*/

const protect = async (req, res, next) => {
  try {
    // 1️⃣ Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not provided"
      });
    }

    // 2️⃣ Verify JWT
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired"
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    // 3️⃣ Fetch user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // 4️⃣ Attach user to request
    req.user = user;

    next();

  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

/*
=======================================================
(Optional Future) 🛡 ROLE-BASED MIDDLEWARE
=======================================================
*/

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    next();
  };
};

const protectOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (user) req.user = user;
      }
    }
  } catch (err) {
    // Ignore errors for optional authentication
  }
  next();
};

/*
=======================================================
EXPORT
=======================================================
*/

module.exports = {
  protect,
  protectOptional,
  authorize
};
