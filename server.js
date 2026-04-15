const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Home route (test in browser)
app.get("/", (req, res) => {
  res.send("Backend Working ✅");
});

// API route (used by your website)
app.post("/api/ai", (req, res) => {
  const { query, payer } = req.body;

  res.json({
    answer: `✅ Connected Successfully!

Query: ${query}
Payer: ${payer}

Backend is working perfectly.`
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
