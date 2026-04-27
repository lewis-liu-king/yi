import express from 'express';
import searchService from '../services/search.service';
import auth from '../middleware/auth';

const router = express.Router();

// Search messages
router.get('/messages', auth, async (req, res, next) => {
  try {
    const { query, conversationId } = req.query;
    const messages = await searchService.searchMessages(
      query as string,
      req.user!.id,
      conversationId as string
    );
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Search conversations
router.get('/', auth, async (req, res, next) => {
  try {
    const { query } = req.query;
    const conversations = await searchService.searchConversations(query as string, req.user!.id);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

export default router;