import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';

// Stocker les utilisateurs connectés
const connectedUsers = new Map(); // userId -> socketId

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Middleware d'authentification Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Utilisateur connecté: ${socket.userId}`);

    // Ajouter l'utilisateur à la liste des connectés
    connectedUsers.set(socket.userId, socket.id);

    // Mettre à jour le statut en ligne
    updateUserOnlineStatus(socket.userId, true);

    // Notifier les autres utilisateurs que cet utilisateur est en ligne
    socket.broadcast.emit('user_online', { userId: socket.userId });

    // Rejoindre les rooms des conversations de l'utilisateur
    joinUserConversations(socket);

    // Événement: Envoyer un message
    socket.on('send_message', async (data) => {
      try {
        const { recipientId, content, conversationId } = data;

        // Créer le message dans la base de données (via le controller)
        const message = await Message.create({
          conversationId,
          sender: socket.userId,
          recipient: recipientId,
          content
        });

        await message.populate('sender', 'firstName lastName profilePhoto');

        // Mettre à jour la conversation
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.lastMessage = {
            content,
            sender: socket.userId,
            createdAt: message.createdAt
          };

          // Incrémenter le compteur de non-lus pour le destinataire
          const currentUnreadCount = conversation.unreadCount.get(recipientId) || 0;
          conversation.unreadCount.set(recipientId, currentUnreadCount + 1);

          conversation.updatedAt = Date.now();
          await conversation.save();
        }

        // Envoyer le message au destinataire s'il est connecté
        const recipientSocketId = connectedUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_message', {
            message,
            conversationId
          });
        }

        // Confirmer l'envoi à l'expéditeur
        socket.emit('message_sent', {
          message,
          conversationId
        });

      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        socket.emit('message_error', {
          error: error.message
        });
      }
    });

    // Événement: Taper un message (typing indicator)
    socket.on('typing', (data) => {
      const { recipientId, conversationId } = data;
      const recipientSocketId = connectedUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_typing', {
          userId: socket.userId,
          conversationId
        });
      }
    });

    // Événement: Arrêter de taper
    socket.on('stop_typing', (data) => {
      const { recipientId, conversationId } = data;
      const recipientSocketId = connectedUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user_stop_typing', {
          userId: socket.userId,
          conversationId
        });
      }
    });

    // Événement: Marquer comme lu
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;

        // Marquer les messages comme lus
        await Message.updateMany(
          {
            conversationId,
            recipient: socket.userId,
            isRead: false
          },
          {
            isRead: true,
            readAt: Date.now()
          }
        );

        // Mettre à jour la conversation
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.unreadCount.set(socket.userId, 0);
          await conversation.save();

          // Notifier l'expéditeur que les messages ont été lus
          const otherParticipant = conversation.participants.find(
            p => p.toString() !== socket.userId
          );

          const otherSocketId = connectedUsers.get(otherParticipant.toString());
          if (otherSocketId) {
            io.to(otherSocketId).emit('messages_read', {
              conversationId,
              readBy: socket.userId
            });
          }
        }

      } catch (error) {
        console.error('Erreur lors du marquage comme lu:', error);
      }
    });

    // Événement: Rejoindre une conversation spécifique
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Événement: Quitter une conversation
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ Utilisateur déconnecté: ${socket.userId}`);

      // Retirer de la liste des connectés
      connectedUsers.delete(socket.userId);

      // Mettre à jour le statut hors ligne
      updateUserOnlineStatus(socket.userId, false);

      // Notifier les autres utilisateurs
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        lastSeen: new Date()
      });
    });
  });

  console.log('✅ Socket.io initialisé');
  return io;
};

// Fonction helper pour rejoindre les conversations de l'utilisateur
const joinUserConversations = async (socket) => {
  try {
    const conversations = await Conversation.find({
      participants: socket.userId,
      status: 'active'
    });

    conversations.forEach(conv => {
      socket.join(`conversation_${conv._id}`);
    });

    console.log(`User ${socket.userId} joined ${conversations.length} conversations`);
  } catch (error) {
    console.error('Erreur lors de la jonction des conversations:', error);
  }
};

// Fonction helper pour mettre à jour le statut en ligne
const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: isOnline ? undefined : new Date()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
  }
};

// Exporter pour utilisation dans d'autres parties de l'app
export const getConnectedUsers = () => connectedUsers;

export default {
  initializeSocket,
  getConnectedUsers
};