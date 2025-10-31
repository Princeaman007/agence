import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe
} from '../controllers/authcontroller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Routes protégées
router.post('/resend-verification', protect, resendVerificationEmail);
router.get('/me', protect, getMe);

export default router;