import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  archiveConversation,
  getMessageLimits
} from '../controllers/messageController.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

// Routes principales
router.post('/', sendMessage); // Envoyer un message
router.get('/conversations', getConversations); // Obtenir toutes les conversations
router.get('/conversation/:conversationId', getMessages); // Obtenir les messages d'une conversation
router.put('/conversation/:conversationId/read', markAsRead); // Marquer comme lu
router.put('/conversation/:conversationId/archive', archiveConversation); // Archiver
router.delete('/:messageId', deleteMessage); // Supprimer un message
router.get('/limits', getMessageLimits); // Obtenir les limites

export default router;