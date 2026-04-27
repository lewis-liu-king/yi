import express from 'express';
import aiService from '../services/ai.service';
import auth from '../middleware/auth';

const router = express.Router();

// Chat with AI
router.post('/chat', auth, async (req, res, next) => {
  try {
    const { message, context, model, temperature } = req.body;
    const result = await aiService.chat({ message, context, model, temperature });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Optimize context
router.post('/context', auth, async (req, res, next) => {
  try {
    const { messages, maxTokens } = req.body;
    const result = await aiService.optimizeContext(messages, maxTokens);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get available AI models
router.get('/models', auth, async (req, res, next) => {
  try {
    const models = await aiService.getAvailableModels();
    res.json(models);
  } catch (error) {
    next(error);
  }
});

export default router;