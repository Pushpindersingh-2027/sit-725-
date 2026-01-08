const express = require("express");
const router = express.Router();
const booksController = require("../controllers/books.controller");

router.get("/", booksController.getAllBooks);
router.get("/:id", booksController.getBookById);

module.exports = router;
