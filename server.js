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

app.get("/", (req, res) => {
  res.send("Medical AI Backend Running");
});

app.post("/api/ai", async (req, res) => {
  try {
    const { query, payer } = req.body;

    const prompt = `
You are a medical coding assistant.

Code/Issue: ${query}
Insurance: ${payer}

Give:
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

  } catch (error) {
    res.json({
      answer: "Error: Unable to fetch AI response"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
