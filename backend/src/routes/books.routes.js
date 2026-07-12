const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const booksController = require("../controllers/books.controller");

router.post("/suggest", auth.protect, booksController.suggestBooks);
router.post("/bookmark", auth.protect, booksController.saveBookmark);

module.exports = router;
