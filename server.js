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

// Test route
app.get("/", (req, res) => {
  res.send("Medical AI Backend Running ✅");
});

// AI route
app.post("/api/ai", async (req, res) => {
  try {
    const { query, payer } = req.body;

    const prompt = `
You are a professional medical coding assistant.

User Query: ${query}
Insurance: ${payer}

Provide structured response:

Brief Answer:
Common Causes:
Fix / Action Steps:
Simple Summary:
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    res.json({
      answer: response.choices[0].message.content
    });

  } catch (error) {
    res.json({
      answer: "❌ AI Error. Check API key or server."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
