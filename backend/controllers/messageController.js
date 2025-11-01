import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

// @desc    Envoyer un message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, messageType = 'text' } = req.body;
    const senderId = req.user._id;

    // Validation
    if (!recipientId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Destinataire et contenu requis'
      });
    }

    // Vérifier que le destinataire existe
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Destinataire non trouvé'
      });
    }

    // Vérifier que l'utilisateur n'essaie pas de s'envoyer un message
    if (senderId.toString() === recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous envoyer un message à vous-même'
      });
    }

    // Vérifier les blocages
    const sender = await User.findById(senderId);
    if (sender.blockedUsers.includes(recipientId) || recipient.blockedUsers.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: 'Impossible d\'envoyer un message à cet utilisateur'
      });
    }

    // Vérifier les limites pour utilisateurs gratuits
    const isPremium = sender.accountType === 'premium' || sender.accountType === 'vip';
    
    if (!isPremium) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Compter les messages envoyés aujourd'hui
      const messagesCount = await Message.countDocuments({
        sender: senderId,
        createdAt: { $gte: today }
      });

      const limit = sender.dailyMessagesLimit || 5;

      if (messagesCount >= limit) {
        return res.status(403).json({
          success: false,
          message: 'Limite de messages quotidienne atteinte',
          limit: limit,
          used: messagesCount,
          upgradeToPremium: true
        });
      }
    }

    // Trouver ou créer la conversation
    let conversation = await Conversation.findOrCreate(senderId, recipientId);

    // Créer le message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      recipient: recipientId,
      content,
      messageType
    });

    // Mettre à jour la conversation
    conversation.lastMessage = {
      content,
      sender: senderId,
      createdAt: message.createdAt
    };
    
    // Incrémenter le compteur de messages non lus pour le destinataire
    const currentUnreadCount = conversation.unreadCount.get(recipientId.toString()) || 0;
    conversation.unreadCount.set(recipientId.toString(), currentUnreadCount + 1);
    
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Mettre à jour le compteur de messages de l'expéditeur si non premium
    if (!isPremium) {
      sender.dailyMessagesCount = (sender.dailyMessagesCount || 0) + 1;
      await sender.save();
    }

    // Populer le message pour la réponse
    await message.populate('sender', 'firstName lastName profilePhoto');
    await message.populate('recipient', 'firstName lastName profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
      data: {
        message,
        conversation: conversation._id,
        messagesRemaining: isPremium ? 'unlimited' : (sender.dailyMessagesLimit - sender.dailyMessagesCount)
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
};

// @desc    Obtenir toutes les conversations de l'utilisateur
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      status: 'active'
    })
      .populate('participants', 'firstName lastName profilePhoto isOnline lastSeen')
      .populate('lastMessage.sender', 'firstName lastName')
      .sort({ updatedAt: -1 });

    // Filtrer pour obtenir l'autre participant
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      const unreadCount = conv.unreadCount.get(userId.toString()) || 0;

      return {
        _id: conv._id,
        participant: otherParticipant,
        lastMessage: conv.lastMessage,
        unreadCount,
        updatedAt: conv.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      data: formattedConversations
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations',
      error: error.message
    });
  }
};

// @desc    Obtenir les messages d'une conversation
// @route   GET /api/messages/conversation/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    // Vérifier que la conversation existe et que l'utilisateur y participe
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Récupérer les messages
    const messages = await Message.find({
      conversationId,
      isDeleted: false
    })
      .populate('sender', 'firstName lastName profilePhoto')
      .populate('recipient', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Compter le total de messages
    const total = await Message.countDocuments({
      conversationId,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(), // Inverser pour avoir du plus ancien au plus récent
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: error.message
    });
  }
};

// @desc    Marquer les messages comme lus
// @route   PUT /api/messages/conversation/:conversationId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Vérifier que la conversation existe
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    // Marquer tous les messages non lus comme lus
    await Message.updateMany(
      {
        conversationId,
        recipient: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: Date.now()
      }
    );

    // Réinitialiser le compteur de messages non lus
    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Messages marqués comme lus'
    });

  } catch (error) {
    console.error('Erreur lors du marquage des messages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages',
      error: error.message
    });
  }
};

// @desc    Supprimer un message
// @route   DELETE /api/messages/:messageId
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'expéditeur
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce message'
      });
    }

    // Marquer comme supprimé
    message.isDeleted = true;
    message.deletedBy.push(userId);
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message',
      error: error.message
    });
  }
};

// @desc    Archiver une conversation
// @route   PUT /api/messages/conversation/:conversationId/archive
// @access  Private
export const archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation non trouvée'
      });
    }

    conversation.status = 'archived';
    await conversation.save();

    res.status(200).json({
      success: true,
      message: 'Conversation archivée'
    });

  } catch (error) {
    console.error('Erreur lors de l\'archivage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'archivage de la conversation',
      error: error.message
    });
  }
};

// @desc    Obtenir les limites de messagerie de l'utilisateur
// @route   GET /api/messages/limits
// @access  Private
export const getMessageLimits = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const isPremium = user.accountType === 'premium' || user.accountType === 'vip';

    if (isPremium) {
      return res.status(200).json({
        success: true,
        data: {
          isPremium: true,
          unlimited: true,
          messagesRemaining: 'unlimited'
        }
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messagesCount = await Message.countDocuments({
      sender: userId,
      createdAt: { $gte: today }
    });

    const limit = user.dailyMessagesLimit || 5;
    const remaining = Math.max(0, limit - messagesCount);

    res.status(200).json({
      success: true,
      data: {
        isPremium: false,
        limit,
        used: messagesCount,
        remaining,
        resetsAt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des limites:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des limites',
      error: error.message
    });
  }
};

export default {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage,
  archiveConversation,
  getMessageLimits
};