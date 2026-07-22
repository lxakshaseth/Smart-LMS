/**
 * Centralized Intelligent Greeting System (Study-Friendly)
 * Smart AI LMS Backend Utility
 */

/**
 * Returns centralized study-friendly greeting information based on hour.
 * @param {string} [userName] - User's display name or full name.
 * @param {Date} [customDate] - Optional date override for testing.
 */
function getGreeting(userName = "", customDate = new Date()) {
  const date = customDate || new Date();
  const hour = date.getHours();

  let greeting = "";
  let subtitle = "";
  let icon = "";
  let period = "morning";

  if (hour >= 5 && hour < 12) {
    greeting = "Good Morning";
    subtitle = "Ready to achieve today's learning goals?";
    icon = "☀️";
    period = "morning";
  } else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
    subtitle = "Keep your learning momentum going!";
    icon = "🌤️";
    period = "afternoon";
  } else if (hour >= 17 && hour < 23) {
    greeting = "Good Evening";
    subtitle = "Let's make today's study session productive!";
    icon = "🌆";
    period = "evening";
  } else {
    // 23:00 - 04:59 (Late Night / Midnight Study Sessions)
    // Never use "Good Night" as the main greeting!
    greeting = "Welcome Back";
    subtitle = "Burning the midnight oil? Let's make this study session count.";
    icon = "🌙";
    period = "midnight";
  }

  const firstName = userName ? String(userName).trim().split(/\s+/)[0] : "";
  const formattedGreeting = firstName
    ? `${icon} ${greeting}, ${firstName}!`
    : `${icon} ${greeting}!`;

  return {
    hour,
    greeting,
    subtitle,
    icon,
    period,
    formattedGreeting,
  };
}

module.exports = {
  getGreeting
};
