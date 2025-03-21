import express from 'express';
import { validateApiKey } from '../middleware/authMiddleware';
import { langChainService } from '../services/langchainService';

const router = express.Router();

// Apply API key validation middleware
router.use(validateApiKey);

// Endpoint to explain a code snippet
router.post('/explain', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        res.status(400).json({ error: 'Code is required in the request body' });
        return;
    }

    try {
        const explanation = await langChainService.explainCode(code);
        res.json({ explanation });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to explain an entire file
router.post('/explain-file', async (req, res) => {
    const { fileContent } = req.body;

    if (!fileContent) {
        res.status(400).json({ error: 'File content is required in the request body' });
        return;
    }

    try {
        const explanation = await langChainService.explainFile(fileContent);
        res.json({ explanation });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to explain multiple files
router.post('/explain-multiple', async (req, res) => {
    const { filesContent } = req.body;

    if (!filesContent) {
        res.status(400).json({ error: 'Files content is required in the request body' });
        return;
    }

    try {
        const explanation = await langChainService.explainMultipleFiles(filesContent);
        res.json({ explanation });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to handle free-text questions
router.post('/ask', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        res.status(400).json({ error: 'Question is required in the request body' });
        return;
    }

    try {
        const answer = await langChainService.askQuestion(question);
        res.json({ answer });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router; 