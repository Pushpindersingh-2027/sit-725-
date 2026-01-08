const express = require("express");
const app = express();
const path = require("path");

const booksRoutes = require("./routes/books.routes");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/books", booksRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
