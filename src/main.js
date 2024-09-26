const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// Middleware to handle JSON requests
app.use(express.json());

// CORS setup (use environment variables to configure origin)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Default to allow all origins if FRONTEND_URL is not set
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials like cookies if needed
}));

// Ensure the API key is set in the environment
if (!process.env.API_KEY) {
  console.error("Error: API_KEY is not defined in .env");
  process.exit(1);
}

// Google Generative AI setup
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Utility function to generate AI content
const generateContent = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text(); // Assuming this is the correct way to get the text
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error('Failed to generate content');
  }
};

// Test route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is running and ready to generate content');
});

// API endpoint to generate content based on the prompt
app.post('/api/content', async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ 
      status: 400, 
      message: 'Question prompt is required' 
    });
  }

  try {
    const result = await generateContent(question);
    res.json({
      status: 200,
      message: 'Content generated successfully',
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error generating content',
      error: error.message || 'Unknown error',
    });
  }
});

// Start the server on the specified port
const PORT = process.env.PORT || 5080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
