const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smart-lms";
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.warn("⚠️ MongoDB Warning:", error.message || error);
    console.warn("⚠️ Server will continue running API services.");
  }
};

module.exports = connectDB;