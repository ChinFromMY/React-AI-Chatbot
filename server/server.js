import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';
import path from 'path';
import {fileURLToPath} from 'url';

dotenv.config(); // load .env variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Hugging Face client
const client = new InferenceClient(process.env.HF_TOKEN);

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ generated_text: "Message is empty." });
  }

  try {
    // Chat completion with DeepSeek
    const chatCompletion = await client.chatCompletion({
      model: "deepseek-ai/DeepSeek-V3.2:novita",
      messages: [{ role: "user", content: message }],
    });

    // Extract the assistant's response
    const botMessage = chatCompletion.choices[0].message?.content || "Sorry, I couldn't generate a response.";

    console.log("Bot response:", botMessage);
    res.json({ generated_text: botMessage });

  } catch (err) {
    console.error("Hugging Face API error:", err);

    // Model not ready yet
    if (err.message.includes("Model is loading")) {
      res.status(503).json({ generated_text: "The model is still loading. Please try again in a few seconds." });
    } else if (err.message.includes("401") || err.message.includes("Forbidden")) {
      res.status(403).json({ generated_text: "Invalid token or no access to the model." });
    } else {
      res.status(500).json({ generated_text: "Something went wrong with Hugging Face." });
    }
  }
});

// server react frontend
app.use(express.static(path.join(__dirname, "../dist")));

// add content security policy headers to allow Google Fonts
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src: 'self'"
  );
  next();
})

// SPA fallback: send index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});


// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
