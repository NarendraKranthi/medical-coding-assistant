const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ OpenAI setup (uses Render environment variable)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Backend Working ✅");
});

// ✅ MAIN API ROUTE
app.post("/api/search", async (req, res) => {
  try {
    const { query, payer } = req.body;

    // 🧠 Strong structured prompt
    const prompt = `
You are a professional medical coding expert.

User Query: ${query}
Insurance: ${payer}

Give response EXACTLY in this format:

Brief Answer:
Common Causes:
Fix / Action Steps:
Simple Summary:

Keep it clear, practical, and useful for medical coders.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const answer = response.choices[0].message.content;

    res.json({ answer });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      answer: "Error: Unable to fetch response from AI.",
    });
  }
});

// ✅ PORT (Render uses this automatically)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
