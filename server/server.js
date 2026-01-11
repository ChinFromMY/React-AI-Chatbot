import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InferenceClient } from '@huggingface/inference';

dotenv.config(); // load .env variables

const app = express();
const PORT = 5000;

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
    const botMessage = chatCompletion.choices[0].message?.content || 
                       "Sorry, I couldn't generate a response.";

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
