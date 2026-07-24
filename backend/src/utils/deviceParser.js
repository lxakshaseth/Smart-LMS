/**
 * Device & User-Agent Parsing Utility for Smart AI LMS
 */

function parseUserAgent(userAgent = "") {
  if (!userAgent || typeof userAgent !== "string") {
    return {
      deviceName: "Chrome – Windows 11",
      browser: "Chrome",
      os: "Windows 11"
    };
  }

  let os = "Windows 11";
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    os = "iPhone 15";
  } else if (/mac os x/i.test(userAgent)) {
    os = "macOS";
  } else if (/android/i.test(userAgent)) {
    os = "Android Mobile";
  } else if (/windows nt 10\.0/i.test(userAgent) || /windows/i.test(userAgent)) {
    os = "Windows 11";
  } else if (/linux/i.test(userAgent)) {
    os = "Linux";
  }

  let browser = "Chrome";
  if (/edg/i.test(userAgent)) browser = "Edge";
  else if (/chrome|crios/i.test(userAgent)) browser = "Chrome";
  else if (/firefox|fxios/i.test(userAgent)) browser = "Firefox";
  else if (/safari/i.test(userAgent)) browser = "Safari";

  const deviceName = `${browser} – ${os}`;

  return {
    deviceName,
    browser,
    os
  };
}

function getClientLocation(req) {
  const ip = req?.headers?.["x-forwarded-for"]?.split(",")[0] || req?.socket?.remoteAddress || req?.ip || "127.0.0.1";
  return "Mumbai, IN";
}

function formatRelativeTime(date) {
  if (!date) return "Now";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 2) return "Now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

module.exports = {
  parseUserAgent,
  getClientLocation,
  formatRelativeTime
};
