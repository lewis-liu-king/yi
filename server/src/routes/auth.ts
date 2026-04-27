import express from 'express';
import authService from '../services/auth.service';
import auth from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/update', auth, async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const user = await authService.updateUser(req.user!.id, { username, email });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Change password
router.post('/change-password', auth, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user!.id, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;