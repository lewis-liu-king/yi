import express from 'express';
import messageService from '../services/message.service';
import auth from '../middleware/auth';

const router = express.Router();

// Create new message
router.post('/', auth, async (req, res, next) => {
  try {
    const { content, parentId, conversationId, sender, metadata } = req.body;
    const message = await messageService.createMessage({
      content,
      parentId,
      conversationId,
      sender,
      metadata
    });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// Get message by id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const message = await messageService.getMessageById(req.params.id, req.user!.id);
    res.json(message);
  } catch (error) {
    next(error);
  }
});

// Update message
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { content, metadata } = req.body;
    const message = await messageService.updateMessage(req.params.id, req.user!.id, {
      content,
      metadata
    });
    res.json(message);
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await messageService.deleteMessage(req.params.id, req.user!.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get child messages
router.get('/:id/children', auth, async (req, res, next) => {
  try {
    const messages = await messageService.getChildMessages(req.params.id, req.user!.id);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Get message context
router.get('/:id/context', auth, async (req, res, next) => {
  try {
    const { depth } = req.query;
    const context = await messageService.getMessageContext(
      req.params.id,
      req.user!.id,
      depth ? parseInt(depth as string) : 3
    );
    res.json(context);
  } catch (error) {
    next(error);
  }
});

// Batch get messages
router.post('/batch', auth, async (req, res, next) => {
  try {
    const { messageIds } = req.body;
    const messages = await messageService.batchGetMessages(messageIds, req.user!.id);
    res.json(messages);
  } catch (error) {
    next(error);
  }
});

export default router;