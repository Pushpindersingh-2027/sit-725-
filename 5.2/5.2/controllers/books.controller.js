const booksService = require("../services/books.service");

function getAllBooks(req, res) {
  const data = booksService.getAllBooks();
  res.json(data);
}

function getBookById(req, res) {
  const book = booksService.getBookById(req.params.id);
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.json(book);
}

module.exports = { getAllBooks, getBookById };
