/**
 * Centralized Intelligent Greeting System (Study-Friendly)
 * Smart AI LMS Frontend Utility
 */

export interface GreetingInfo {
  hour: number;
  greeting: string;
  subtitle: string;
  icon: string;
  period: "morning" | "afternoon" | "evening" | "midnight";
  formattedGreeting: string;
}

/**
 * Returns centralized study-friendly greeting information based on current system time.
 * @param userName - Optional user's name to personalize the greeting.
 * @param customDate - Optional custom Date object for testing.
 */
export function getGreeting(userName?: string, customDate?: Date): GreetingInfo {
  const date = customDate || new Date();
  const hour = date.getHours();

  let greeting = "";
  let subtitle = "";
  let icon = "";
  let period: "morning" | "afternoon" | "evening" | "midnight" = "morning";

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
    // 23:00 - 04:59 (Late-night study sessions)
    // NEVER use "Good Night" as a main greeting
    greeting = "Welcome Back";
    subtitle = "Burning the midnight oil? Let's make this study session count.";
    icon = "🌙";
    period = "midnight";
  }

  const firstName = userName ? userName.trim().split(/\s+/)[0] : "";
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
