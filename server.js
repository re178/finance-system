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
