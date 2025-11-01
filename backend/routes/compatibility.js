import express from 'express';
import {
  submitTest,
  getMyTest,
  calculateCompatibility,
  getMatches,
  getCompatibilityDetails
} from '../controllers/compatibilityController.js';
import { protect, requireEmailVerification, isPremium } from '../middleware/auth.js';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(protect);
router.use(requireEmailVerification);

// Routes publiques (tous les utilisateurs authentifiés)
router.post('/submit', submitTest);
router.get('/my-test', getMyTest);
router.get('/calculate/:userId', calculateCompatibility);
router.get('/matches', getMatches);

// Routes Premium/VIP uniquement
router.get('/details/:userId', isPremium, getCompatibilityDetails);

export default router;