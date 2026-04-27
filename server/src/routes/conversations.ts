import express from 'express';
import conversationService from '../services/conversation.service';
import auth from '../middleware/auth';

const router = express.Router();

// Get all conversations
router.get('/', auth, async (req, res, next) => {
  try {
    const conversations = await conversationService.getConversations(req.user!.id);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

// Create new conversation
router.post('/', auth, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const conversation = await conversationService.createConversation({
      title,
      description,
      userId: req.user!.id
    });
    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
});

// Get conversation by id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const conversation = await conversationService.getConversationById(req.params.id, req.user!.id);
    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

// Update conversation
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const conversation = await conversationService.updateConversation(req.params.id, req.user!.id, {
      title,
      description
    });
    res.json(conversation);
  } catch (error) {
    next(error);
  }
});

// Delete conversation
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await conversationService.deleteConversation(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get conversation stats
router.get('/:id/stats', auth, async (req, res, next) => {
  try {
    const stats = await conversationService.getConversationStats(req.params.id, req.user!.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;