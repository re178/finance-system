import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import cors from "cors";
import bodyParser from "body-parser";

// CREATE APP FIRST
const app = express();

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// DATABASE SETUP
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { users: [], transactions: [] });

await db.read();
db.data ||= { users: [], transactions: [] };

// HOME
app.get("/", (req, res) => {
  res.send("Finance System API is running...");
});

// ADD TRANSACTION
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

// GET TRANSACTIONS
app.get("/transactions", (req, res) => {
  res.json(db.data.transactions);
});

// REGISTER
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

// LOGIN
app.post("/login", (req, res) => {
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
app.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);
  db.data.transactions = db.data.transactions.filter(t => t.id !== id);
  await db.write();
  res.send({ message: "Deleted" });
});
// GET ALL USERS (ADMIN)
app.get("/users", (req, res) => {
  res.json(db.data.users);
});

// MAKE USER ADMIN
app.post("/make-admin", async (req, res) => {
  const { id } = req.body;
  const user = db.data.users.find(u => u.id === id);

  if (!user) return res.send({ error: "User not found" });

  user.role = "admin";
  await db.write();

  res.send({ message: "User promoted to admin" });
});

// START SERVER
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
app.delete("/delete/:id", async (req, res) => {
  const id = Number(req.params.id);
  db.data.transactions = db.data.transactions.filter(t => t.id !== id);
  await db.write();
  res.send({ message: "Deleted" });
});

