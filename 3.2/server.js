const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Load plants from seed file
const dataPath = path.join(__dirname, "plants.json");
let plants = [];

if (fs.existsSync(dataPath)) {
  plants = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
}

// GET all plants
app.get("/api/plants", (req, res) => {
  res.json({ plants });
});

// POST new plant (manual add)
app.post("/api/plants", (req, res) => {
  const { name, type, care, image, description } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Plant name is required" });
  }

  const newPlant = {
    name: name.trim(),
    type: (type || "Unknown").trim(),
    care: (care || "Not provided").trim(),
    image:
      image && image.trim().length > 0
        ? image.trim()
        : "https://via.placeholder.com/400x250?text=Plant+Image",
    description: (description || "").trim()
  };

  plants.push(newPlant);

  // Persist to JSON file
  fs.writeFileSync(dataPath, JSON.stringify(plants, null, 2));

  res.status(201).json(newPlant);
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
