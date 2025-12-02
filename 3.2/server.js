const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Hard-coded recipe data (in place of kittens/cards)
const recipes = [
  {
    id: 1,
    title: '5-Minute Veggie Wrap',
    difficulty: 'Easy',
    time: '5 mins',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
    description: 'A quick tortilla wrap with hummus, salad mix and crunchy veggies.'
  },
  {
    id: 2,
    title: 'One-Pot Pasta',
    difficulty: 'Medium',
    time: '20 mins',
    image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
    description: 'Simple tomato-based pasta cooked in one pot – less mess, more flavour.'
  },
  {
    id: 3,
    title: 'Overnight Oats Jar',
    difficulty: 'Easy',
    time: '10 mins + fridge',
    image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg',
    description: 'Healthy oats soaked in milk with fruit and nuts, ready for busy mornings.'
  }
];

// Serve static files (Materialize-based frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Simple GET REST endpoint returning recipe data
app.get('/api/recipes', (req, res) => {
  res.json(recipes);
});

// Optional health endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Quick Recipes API',
    version: '1.0.0',
    count: recipes.length
  });
});

app.listen(port, () => {
  console.log(`Quick Recipes app running at http://localhost:${port}`);
});
