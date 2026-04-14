import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/ai", async (req, res) => {
  const { query, payer } = req.body;

  const prompt = `
You are a medical coding assistant.

Code/Issue: ${query}
Insurance: ${payer}

Return:
Brief Answer
Common Causes
Fix / Action Steps
Simple Summary
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }]
  });

  res.json({
    answer: response.choices[0].message.content
  });
});

app.listen(3000, () => console.log("Server running"));
