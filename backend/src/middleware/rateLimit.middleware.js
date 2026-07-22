const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Disable the X-Forwarded-For strict check — we set 'trust proxy' in
  // server.js which is the correct fix. This is belt-and-suspenders to
  // prevent ERR_ERL_UNEXPECTED_X_FORWARDED_FOR crashing the server on Render.
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

module.exports = {
  apiLimiter
};
