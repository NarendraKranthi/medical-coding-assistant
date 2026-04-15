const express = require("express");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Medical AI Backend Running ✅");
});

app.post("/api/ai", async (req, res) => {
  try {
    const { query, payer } = req.body;

    const prompt = `
You are a medical coding assistant.

Query: ${query}
Insurance: ${payer}

Give:
Brief Answer:
Common Causes:
Fix / Action Steps:
Simple Summary:
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({
      answer: response.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.json({
      answer: "❌ AI error. Please check API setup."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
