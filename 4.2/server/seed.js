import mongoose from "mongoose";
import dotenv from "dotenv";
import Item from "./models/Item.js";

dotenv.config();

const seedData = [
  { title: "Coffee", category: "Drink", price: 4.5, inStock: true },
  { title: "Sandwich", category: "Food", price: 7.0, inStock: true },
  { title: "Muffin", category: "Snack", price: 5.0, inStock: false },
  { title: "Green Tea", category: "Drink", price: 3.5, inStock: true },
  { title: "Pasta", category: "Food", price: 12.0, inStock: true }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB connected for seeding");

    await Item.deleteMany({});
    await Item.insertMany(seedData);

    console.log("✅ Seed complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
