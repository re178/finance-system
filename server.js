app.use(express.static("public"));
import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import cors from "cors";
import bodyParser from "body-parser";

// Setup database
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { users: [], transactions: [] });

// Load DB
await db.read();
db.data ||= { users: [], transactions: [] };

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Finance System API is running...");
});

// Create transaction
app.post("/add-transaction", async (req, res) => {
  db.data.transactions.push({
    id: Date.now(),
    type: req.body.type,
    amount: req.body.amount,
    category: req.body.category,
    date: new Date()
  });

  await db.write();
  res.send({ message: "Transaction added" });
});

// Get all transactions
app.get("/transactions", async (req, res) => {
  res.json(db.data.transactions);
});

app.listen(3000, () => {
  console.log("Server running");
});
// Register user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = db.data.users.find(u => u.username === username);
  if (exists) return res.send({ error: "Username already exists" });

  db.data.users.push({
    id: Date.now(),
    username,
    password,
    role: "user"
  });

  await db.write();
  res.send({ message: "Account created successfully" });
});

// Login user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = db.data.users.find(
    u => u.username === username && u.password === password
  );

  if (!user) return res.send({ error: "Invalid login" });

  res.send({
    message: "Login successful",
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});
