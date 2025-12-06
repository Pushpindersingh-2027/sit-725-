const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Event = require("./models/Event");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://127.0.0.1:27017/shiftsync", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", async (req, res) => {
  const events = await Event.find();
  res.render("index", { events });
});

app.post("/add", async (req, res) => {
  await Event.create(req.body);
  res.redirect("/");
});

app.listen(3000, () => console.log("Server running at http://localhost:3000"));
