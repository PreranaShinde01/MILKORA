
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const MilkRecord = require("./models/MilkRecord");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Milk Dairy API is running" });
});

// Add a milk collection record
app.post("/api/records", async (req, res) => {
  try {
    const { customerName, milkType, quantity, rate } = req.body;

    if (
      !customerName?.trim() ||
      !["Cow", "Buffalo"].includes(milkType) ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(rate) ||
      quantity <= 0 ||
      rate < 0
    ) {
      return res.status(400).json({ message: "Please enter valid milk details." });
    }

    const totalAmount = Math.round(quantity * rate * 100) / 100;

    const record = await MilkRecord.create({
      customerName: customerName.trim(),
      milkType,
      quantity,
      rate,
      totalAmount
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: "Could not save milk record." });
  }
});

// View all milk collection records
app.get("/api/records", async (req, res) => {
  try {
    const records = await MilkRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch milk records." });
  }
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
