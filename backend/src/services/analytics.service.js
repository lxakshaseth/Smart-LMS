// =======================================================
// 📊 ANALYTICS SERVICE - ADAPTIVE INTELLIGENCE ENGINE
// =======================================================


// =======================================================
// 🔧 Utility Function
// =======================================================
function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}


// =======================================================
// 1️⃣ RISK CALCULATION ENGINE
// =======================================================
function calculateRisk({ accuracy = 0, completion = 0, streak = 0 }) {

  let score = 0;

  // Accuracy impact (40%)
  score += (100 - accuracy) * 0.4;

  // Completion impact (30%)
  score += (100 - completion) * 0.3;

  // Streak impact (30%)
  let streakImpact = streak <= 2
    ? 80
    : (100 - streak * 5);

  score += streakImpact * 0.3;

  score = clamp(Math.round(score));

  let level = "Low";
  if (score >= 70) level = "High";
  else if (score >= 40) level = "Medium";

  return { score, level };
}


// =======================================================
// 2️⃣ PERFORMANCE TREND DETECTION
// =======================================================
function detectTrend(accuracyHistory = []) {

  if (!accuracyHistory || accuracyHistory.length < 3)
    return "Stable";

  const recent = accuracyHistory.slice(-5);
  const first = recent[0]?.accuracy || 0;
  const last = recent[recent.length - 1]?.accuracy || 0;

  if (last > first + 5) return "Improving";
  if (last < first - 5) return "Declining";

  return "Stable";
}


// =======================================================
// 3️⃣ WEEKLY COMPLETION CALCULATION
// =======================================================
function calculateWeeklyCompletion(weeklyPlan = []) {

  let total = 0;
  let completed = 0;

  weeklyPlan.forEach(day => {
    if (day.tasks?.length) {
      total += day.tasks.length;
      day.tasks.forEach(task => {
        if (task.completed) completed++;
      });
    }
  });

  if (total === 0) return 0;

  return clamp(Math.round((completed / total) * 100));
}


// =======================================================
// 4️⃣ APPLY COMPLETION IMPACT
// =======================================================
function applyCompletionImpact(planner, task) {

  if (!planner || !task) return planner;

  let reduction = 2;

  switch (task.type) {
    case "Weak Practice": reduction = 6; break;
    case "Mock": reduction = 8; break;
    case "Revision": reduction = 4; break;
    case "Core": reduction = 3; break;
  }

  planner.riskScore = clamp((planner.riskScore || 50) - reduction);

  if (planner.riskScore >= 70) planner.riskLevel = "High";
  else if (planner.riskScore >= 40) planner.riskLevel = "Medium";
  else planner.riskLevel = "Low";

  return planner;
}


// =======================================================
// 5️⃣ UPDATE PLANNER ANALYTICS
// =======================================================
function updatePlannerAnalytics(planner) {

  if (!planner) return planner;

  planner.performanceTrend = detectTrend(planner.accuracyHistory);

  const { score, level } = calculateRisk({
    accuracy: planner.lastMockAccuracy || 0,
    completion: planner.weeklyCompletion || 0,
    streak: planner.studyStreak || 0
  });

  planner.riskScore = score;
  planner.riskLevel = level;

  return planner;
}


// =======================================================
// 6️⃣ CONFIDENCE ENGINE
// =======================================================
function calculateConfidence(planner, subject) {

  const subjectData =
    planner.subjectStats?.find(s => s.subject === subject);

  const mastery = subjectData?.mastery ?? 50;
  const accuracy = planner.lastMockAccuracy ?? 50;

  let confidenceScore =
    (mastery * 0.6) +
    (accuracy * 0.4);

  confidenceScore = clamp(Math.round(confidenceScore));

  let confidenceLevel = "Low";
  if (confidenceScore >= 75) confidenceLevel = "High";
  else if (confidenceScore >= 50) confidenceLevel = "Medium";

  return { confidenceScore, confidenceLevel };
}


// =======================================================
// 7️⃣ SCORE PREDICTION ENGINE
// =======================================================
function predictNextScore(planner) {

  const accuracy = planner.lastMockAccuracy ?? 50;
  const completion = planner.weeklyCompletion ?? 50;
  const riskScore = planner.riskScore ?? 50;

  let predicted =
    (accuracy * 0.5) +
    (completion * 0.3) +
    ((100 - riskScore) * 0.2);

  if (planner.performanceTrend === "Improving")
    predicted += 5;

  if (planner.performanceTrend === "Declining")
    predicted -= 5;

  predicted = clamp(Math.round(predicted));

  return { predictedNextScore: predicted };
}


// =======================================================
// 8️⃣ EXAM READINESS ENGINE
// =======================================================
function calculateExamReadiness(planner, confidenceScore, predictedScore) {

  const riskFactor = 100 - (planner.riskScore ?? 50);

  let readiness =
    (confidenceScore * 0.4) +
    (predictedScore * 0.4) +
    (riskFactor * 0.2);

  readiness = clamp(Math.round(readiness));

  let readinessStatus = "Not Ready";
  if (readiness >= 75) readinessStatus = "Ready";
  else if (readiness >= 50) readinessStatus = "Average";

  const focusArea =
    planner.weakSubject || "Revise weak topics";

  return {
    examReadinessIndex: readiness,
    readinessStatus,
    focusArea
  };
}


// =======================================================
// 9️⃣ FOCUS SCORE ENGINE (NEW FIX)
// =======================================================
function calculateFocusScore(planner, user) {

  const completion = planner.weeklyCompletion ?? 0;
  const streak = planner.studyStreak ?? 0;
  const risk = planner.riskScore ?? 50;

  let score =
    (completion * 0.4) +
    (streak * 2) +
    ((100 - risk) * 0.4);

  score = clamp(Math.round(score));

  return score;
}


// =======================================================
// 🔟 BURNOUT RISK ENGINE
// =======================================================
function calculateBurnoutRisk(planner) {

  const completion = planner.weeklyCompletion ?? 0;
  const streak = planner.studyStreak ?? 0;

  if (completion > 90 && streak > 15) return "High";
  if (completion > 75) return "Medium";

  return "Low";
}


// =======================================================
// EXPORTS
// =======================================================
module.exports = {
  clamp,
  calculateRisk,
  detectTrend,
  calculateWeeklyCompletion,
  applyCompletionImpact,
  updatePlannerAnalytics,
  calculateConfidence,
  predictNextScore,
  calculateExamReadiness,
  calculateFocusScore,      // ✅ FIXED
  calculateBurnoutRisk
};
