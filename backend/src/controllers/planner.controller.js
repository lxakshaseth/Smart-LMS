const Planner = require("../models/planner.model");
const User = require("../models/user.model");

const {
  calculateWeeklyCompletion,
  applyCompletionImpact,
  updatePlannerAnalytics
} = require("../services/analytics.service");

const {
  generateAdaptivePlanner,
  generateWeeklyReview,
  generateAIResponse
} = require("../services/ai.service");


/* =====================================================
   1️⃣ GET PLANNER
===================================================== */
exports.getPlanner = async (req, res) => {
  try {

    let planner = await Planner.findOne({ user: req.user.id });

    if (!planner) {
      planner = await Planner.create({
        user: req.user.id,
        weeklyPlan: [],
        subjectStats: [],
        weeklyCompletion: 0,
        riskScore: 50,
        riskLevel: "Medium"
      });
    }

    res.json({ success: true, planner });

  } catch (error) {
    console.error("Get Planner Error:", error);
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   2️⃣ UPDATE PLANNER
===================================================== */
exports.updatePlanner = async (req, res) => {
  try {

    const planner = await Planner.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, upsert: true }
    );

    res.json({ success: true, planner });

  } catch (error) {
    console.error("Update Planner Error:", error);
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   3️⃣ TOGGLE TASK COMPLETE
===================================================== */
exports.toggleTaskComplete = async (req, res) => {

  try {

    const { dayIndex, taskIndex } = req.body;

    const planner = await Planner.findOne({ user: req.user.id });
    const user = await User.findById(req.user.id);

    if (!planner)
      return res.status(404).json({ success: false });

    if (!planner.weeklyPlan?.[dayIndex]?.tasks?.[taskIndex])
      return res.status(400).json({ success: false });

    const task = planner.weeklyPlan[dayIndex].tasks[taskIndex];

    task.completed = !task.completed;

    applyCompletionImpact(planner, task);

    planner.weeklyCompletion =
      calculateWeeklyCompletion(planner.weeklyPlan);

    if (task.completed && user) {
      user.xp += 5 * (task.weight || 1);
      user.updateLevelAndRank();
      await user.save();
    }

    updatePlannerAnalytics(planner);
    await planner.save();

    res.json({
      success: true,
      weeklyCompletion: planner.weeklyCompletion,
      riskScore: planner.riskScore,
      riskLevel: planner.riskLevel
    });

  } catch (error) {
    console.error("Toggle Task Error:", error);
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   4️⃣ GENERATE ADAPTIVE PLAN
===================================================== */
exports.generatePlan = async (req, res) => {

  try {

    const planner = await Planner.findOne({ user: req.user.id });

    if (!planner)
      return res.status(404).json({ success: false });

    const adaptivePlan = await generateAdaptivePlanner({
      accuracy: planner.lastMockAccuracy || 50,
      riskScore: planner.riskScore || 50,
      trend: planner.performanceTrend || "Stable",
      weakSubject: planner.weakSubject || "General"
    });

    planner.weeklyPlan = adaptivePlan.weeklyPlan || [];
    planner.weeklyCompletion = 0;

    updatePlannerAnalytics(planner);
    await planner.save();

    res.json({
      success: true,
      weeklyPlan: planner.weeklyPlan
    });

  } catch (error) {
    console.error("Generate Plan Error:", error);
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   5️⃣ ANALYZE PLANNER
===================================================== */
exports.analyzePlanner = async (req, res) => {

  try {

    const planner = await Planner.findOne({ user: req.user.id });

    if (!planner)
      return res.status(404).json({ success: false });

    res.json({
      success: true,
      riskScore: planner.riskScore,
      riskLevel: planner.riskLevel,
      performanceTrend: planner.performanceTrend,
      weeklyCompletion: planner.weeklyCompletion,
      weakSubject: planner.weakSubject
    });

  } catch (error) {
    console.error("Analyze Planner Error:", error);
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   6️⃣ WEEKLY REVIEW
===================================================== */
exports.generateWeeklyReview = async (req, res) => {

  try {

    const planner = await Planner.findOne({ user: req.user.id });

    if (!planner)
      return res.status(404).json({ success: false });

    const review = await generateWeeklyReview({
      accuracy: planner.lastMockAccuracy,
      riskScore: planner.riskScore,
      completion: planner.weeklyCompletion,
      trend: planner.performanceTrend,
      weakSubject: planner.weakSubject
    });

    planner.lastWeeklyReview = review;
    await planner.save();

    res.json({ success: true, review });

  } catch (error) {
    console.error("Weekly Review Error:", error);
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   7️⃣ DASHBOARD
===================================================== */
exports.getDashboard = async (req, res) => {

  try {

    const planner = await Planner.findOne({ user: req.user.id });
    const user = await User.findById(req.user.id);

    if (!planner || !user)
      return res.json({ success: false });

    updatePlannerAnalytics(planner);
    await planner.save();

    res.json({
      success: true,
      progress: planner.lastMockAccuracy || 0,
      riskLevel: planner.riskLevel,
      riskScore: planner.riskScore,
      weeklyCompletion: planner.weeklyCompletion,
      streak: user.streak || 0,
      weakSubject: planner.weakSubject || "-"
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   8️⃣ APPLY RECOMMENDATION (NEVER FAIL VERSION)
===================================================== */
exports.applyRecommendation = async (req, res) => {

  try {

    const planner = await Planner.findOne({ user: req.user.id });

    if (!planner)
      return res.status(404).json({ success: false });

    const stats = planner.subjectStats || [];

    // If no subject data → just slightly rebalance weights
    if (!stats.length) {

      planner.weeklyPlan.forEach(day => {
        day.tasks?.forEach(task => {
          task.weight = (task.weight || 1) + 0.5;
        });
      });

      await planner.save();

      return res.json({
        success: true,
        message: "Recommendation applied (basic rebalance)"
      });
    }

    // Find weakest subject
    const weakest = stats.reduce((min, s) =>
      s.mastery < min.mastery ? s : min, stats[0]);

    planner.weeklyPlan.forEach(day => {
      day.tasks?.forEach(task => {

        task.weight = task.weight || 1;

        if (task.subject === weakest.subject)
          task.weight += 1;
        else
          task.weight = Math.max(1, task.weight - 0.5);

      });
    });

    planner.weakSubject = weakest.subject;

    updatePlannerAnalytics(planner);
    await planner.save();

    res.json({
      success: true,
      message: "Recommendation applied successfully"
    });

  } catch (error) {
    console.error("Apply Recommendation Error:", error);
    res.status(500).json({ success: false });
  }
};


/* =====================================================
   9️⃣ GENERATE TOMORROW PLAN
===================================================== */
exports.generateTomorrowPlan = async (req, res) => {

  try {

    const planner = await Planner.findOne({ user: req.user.id });

    if (!planner)
      return res.status(404).json({ success: false });

    const stats = planner.subjectStats || [];

    if (!planner.weeklyPlan.length)
      planner.weeklyPlan.push({ day: "Tomorrow", tasks: [] });

    const subject =
      stats.length
        ? stats.reduce((min, s) =>
            s.mastery < min.mastery ? s : min, stats[0]).subject
        : "General";

    planner.weeklyPlan[0].tasks.push({
      subject,
      topic: "Focused Revision + Practice",
      weight: 3,
      completed: false
    });

    updatePlannerAnalytics(planner);
    await planner.save();

    res.json({
      success: true,
      message: "Tomorrow plan generated"
    });

  } catch (error) {
    console.error("Tomorrow Plan Error:", error);
    res.status(500).json({ success: false });
  }
};

/* =====================================================
   11️⃣ PLANNER AI STUDY ASSISTANT CHAT
===================================================== */
exports.chatPlanner = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const planner = await Planner.findOne({ user: req.user.id });
    const weakSubject = planner ? planner.weakSubject || "General" : "General";

    const prompt = `
You are a professional academic study mentor. The user has a weak subject: ${weakSubject}.

Rules:
1. You MUST ONLY discuss study-related topics, exam preparation, schedule planning, time management, academic subjects, and advice on how to improve weak topics.
2. Academic subjects, computer science terms, engineering topics, and concepts (such as "dbms", "web dev", "programming concepts", "algorithms", "physics", "math", "history") are ON-TOPIC. You must help the user learn and understand them.
3. Friendly greetings (such as "hi", "hello", "hey", "good morning") are ON-TOPIC. Respond with a welcoming, brief greeting and offer to assist them with their studies.
4. If the user's message is completely unrelated to study, academic subjects, exam prep, or learning (e.g., asking how to cook, asking for jokes, discussing sports/movies, asking to write software scripts unrelated to learning, etc.), you MUST politely reject it. Only block items that are clearly non-educational. If blocked, respond with exactly: "I am your study mentor and can only assist with academic or study-related queries. Let's focus on improving your studies!"
5. Output your response ONLY as clear, conversational, professional plain text.
6. CRITICAL: Keep your responses extremely short, concise, and clear to understand (maximum 2 sentences). Avoid long paragraphs, wordy intros, or wordy explanations. Get straight to the point.

User's Message: "${message}"
`;

    const responseText = await generateAIResponse(prompt, {
      temperature: 0.95,
      system: "You are a professional academic study mentor. Respond ONLY in extremely short, concise plain conversational text (maximum 2 sentences). Avoid JSON, lists, or code blocks."
    });
    res.json({ success: true, reply: responseText });

  } catch (error) {
    console.error("Planner Chat Error:", error);
    res.status(500).json({ success: false, message: "AI Assistant failed" });
  }
};
