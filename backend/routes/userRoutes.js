import express from 'express';
import { protect, isPremium, isEmailVerified } from '../middleware/auth.js';
import {
  getUserProfile,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  setProfilePhoto,
  blockUser,
  unblockUser,
  searchUsers
} from '../controllers/userController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Routes publiques (avec protection)
router.get('/search', protect, searchUsers); // Route de recherche
router.get('/:id', protect, getUserProfile); // Obtenir un profil utilisateur

// Routes protégées - Gestion du profil
router.put('/profile', protect, updateProfile); // Mettre à jour le profil

// Routes protégées - Gestion des photos
router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto); // Upload photo
router.delete('/photo/:photoId', protect, deletePhoto); // Supprimer une photo
router.put('/profile-photo/:photoId', protect, setProfilePhoto); // Définir photo de profil

// Routes protégées - Blocage d'utilisateurs
router.post('/block/:userId', protect, blockUser); // Bloquer un utilisateur
router.delete('/block/:userId', protect, unblockUser); // Débloquer un utilisateur

export default router;