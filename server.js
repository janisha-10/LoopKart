const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

app.post("/ai-assistant", async (req, res) => {
  try {
    const userMsg = req.body.message;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `
You are an AI industrial assistant for a B2B manufacturing marketplace.
Help buyers and sellers with:
- Product selection
- Material recommendations
- RFQ (Request for Quotation) creation
- Industrial comparisons
- Technical guidance

User query: ${userMsg}

Give practical, business-focused answers.
`
              }
            ]
          }
        ]
      }
    );

    const aiReply =
      response.data.candidates[0].content.parts[0].text;

    res.json({ reply: aiReply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "AI service error" });
  }
});

app.listen(3000, () => {
  console.log("Manufacturing AI running on http://localhost:3000");
});
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "YOUR_API_KEY_HERE";

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: userMessage }] }
          ]
        })
      }
    );

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Gemini API failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
