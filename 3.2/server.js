const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const plants = [
  {
    id: 1,
    name: "Snake Plant",
    type: "Indoor",
    care: "Low",
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=60",
    description: "Hardy indoor plant, great for beginners."
  },
  {
    id: 2,
    name: "Peace Lily",
    type: "Indoor",
    care: "Medium",
    image: "https://images.unsplash.com/photo-1615471618985-971989a44e47?auto=format&fit=crop&w=900&q=60",
    description: "Beautiful flowering plant that likes shade."
  },
  {
    id: 3,
    name: "Aloe Vera",
    type: "Indoor/Outdoor",
    care: "Low",
    image: "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=900&q=60",
    description: "Succulent plant known for its healing gel."
  }
];

app.get("/api/plants", (req, res) => {
  res.json({ plants });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
