const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();

// Allow CORS for specific frontend domain (or use '*' to allow all origins)
app.use(cors({
  origin: '*', // Frontend domain (replace with your frontend URL)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Include credentials like cookies in cross-origin requests if needed
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(express.json());

// Google Generative AI setup
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/', (req, res) => {
    res.send('Hello World');
});

const generate = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Error in generating content:", error);
        throw error;
    }
};

app.post('/api/content', async (req, res) => {
    try {
        const prompt = req.body.question;
        if (!prompt) {
            return res.status(400).json({ message: 'Question prompt is required' });
        }
        const result = await generate(prompt);
        res.json({
            status: 200,
            message: result
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating content', error });
    }
});

// Start the server
const PORT = process.env.PORT || 5080;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
