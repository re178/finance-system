import 'dotenv/config'; // Loads environment variables from Render
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// 🔌 Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

// 📌 Schemas
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String
});

const transactionSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  category: String,
  date: { type: Date, default: Date.now }
});

// 📌 Models
const User = mongoose.model("User", userSchema);
const Transaction = mongoose.model("Transaction", transactionSchema);

// ---------------- ROUTES ----------------

// Home
app.get("/", (req, res) => {
  res.send("Finance System API is running...");
});

// Register user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.send({ error: "Username already exists" });

  await User.create({ username, password, role: "user" });
  res.send({ message: "Account created successfully" });
});

// Login user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.send({ error: "Invalid login" });

  res.send({ message: "Login successful", user: { id: user._id, username: user.username, role: user.role } });
});

// Add transaction
app.post("/add-transaction", async (req, res) => {
  await Transaction.create({
    type: req.body.type,
    amount: req.body.amount,
    category: req.body.category
  });
  res.send({ message: "Transaction added" });
});

// Get all transactions
app.get("/transactions", async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

// Delete transaction
app.delete("/delete/:id", async (req, res) => {
  await Transaction.deleteOne({ _id: req.params.id });
  res.send({ message: "Deleted" });
});

// Financial summary
app.get("/summary", async (req, res) => {
  const transactions = await Transaction.find();
  const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;
  res.json({ income, expense, balance });
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

