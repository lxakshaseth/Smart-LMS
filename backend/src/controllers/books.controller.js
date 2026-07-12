const Bookmark = require("../models/bookmark.model");


// AI AUTO DETECT LEVEL
exports.suggestBooks = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic required"
      });
    }

    const lower = topic.toLowerCase();
    let level = "general";
    let books = [];

    // 🏫 SCHOOL DETECTION
    if (lower.includes("class") ||
        lower.includes("ncert") ||
        lower.includes("maths") ||
        lower.includes("science")) {

      level = "school";

      books.push({
        title: "NCERT Official Books",
        link: "https://ncert.nic.in/textbook.php"
      });
    }

    // 🎓 ENGINEERING DETECTION
    if (lower.includes("data") ||
        lower.includes("algorithm") ||
        lower.includes("engineering") ||
        lower.includes("spu") ||
        lower.includes("sppu")) {

      level = "engineering";

      books.push({
        title: "Open Data Structures",
        link: "https://opendatastructures.org/"
      });

      books.push({
        title: "MIT OpenCourseWare",
        link: "https://ocw.mit.edu/"
      });
    }

    // DEFAULT FREE LIBRARY
    books.push({
      title: "Open Library",
      link: "https://openlibrary.org/"
    });

    res.json({
      success: true,
      level,
      books
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};



// BOOKMARK SAVE
exports.saveBookmark = async (req, res) => {
  try {
    const { title, link } = req.body;

    const bookmark = await Bookmark.create({
      user: req.user.id,
      title,
      link
    });

    res.json({
      success: true,
      bookmark
    });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};
