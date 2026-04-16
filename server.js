const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend Working ✅");
});

app.post("/api/search", async (req, res) => {
  try {

    const { query, payer } = req.body;

    const prompt = `
You are a professional medical coding expert.

User Input: ${query}
Insurance: ${payer}

Analyze and respond in this format:

Brief Answer:
Common Causes:
Fix / Action Steps:
Simple Summary:

Keep it practical and coder-friendly.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      answer: response.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.json({ answer: "Error getting AI response" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
