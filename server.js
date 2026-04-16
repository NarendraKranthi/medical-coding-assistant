const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Safe OpenAI setup (no crash if key missing)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} else {
  console.log("⚠️ OpenAI API Key not found - running in fallback mode");
}

// ✅ Root check
app.get("/", (req, res) => {
  res.send("Backend Working ✅");
});

// ✅ MAIN API
app.post("/api/search", async (req, res) => {
  try {
    const { query, payer } = req.body;

    // 🔍 Detect type
    let type = "Denial";
    if (/^\d{5}$/.test(query)) type = "CPT";
    else if (/^[A-Z]\d{2}/i.test(query)) type = "ICD";
    else if (query.length > 50) type = "Complex Case";

    let answer = "";

    // 🤖 If API key available → use AI
    if (openai) {
      const prompt = `
You are a medical coding assistant.

User Input: ${query}
Insurance: ${payer || "General"}

Give structured answer ONLY in this format:

Brief Answer:
Common Causes:
Fix / Action Steps:
Simple Summary:

Keep it clear, professional, and practical.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      answer = response.choices[0].message.content;
    } else {
      // 🧪 Fallback (no API key)
      answer = `
Brief Answer:
This is demo mode. AI response is not enabled.

Common Causes:
- API key missing
- Backend running without AI

Fix / Action Steps:
- Add OPENAI_API_KEY in Render environment variables

Simple Summary:
Backend is working but AI is not connected.
`;
    }

    // 🔗 Reference links (smart)
    let references = [];

    if (payer) {
      const p = payer.toLowerCase();

      if (p.includes("medicare")) {
        references.push({
          title: "CMS Medicare Guidelines",
          link: "https://www.cms.gov/medicare"
        });
      }

      if (p.includes("aetna")) {
        references.push({
          title: "Aetna Clinical Policy",
          link: "https://www.aetna.com/health-care-professionals.html"
        });
      }

      if (p.includes("united")) {
        references.push({
          title: "UnitedHealthcare Policy",
          link: "https://www.uhcprovider.com/"
        });
      }

      if (p.includes("blue")) {
        references.push({
          title: "BCBS Guidelines",
          link: "https://www.bcbs.com/"
        });
      }
    }

    // 🎯 Send response
    res.json({
      type,
      answer,
      references,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Server error",
    });
  }
});

// ✅ PORT (Render compatible)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
