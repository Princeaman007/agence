import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Initialiser la connexion Socket.io
  connect(token) {
    if (this.socket?.connected) {
      console.log('✅ Socket déjà connecté');
      return;
    }

    // ✅ Utiliser VITE_BASE_URL au lieu de VITE_API_URL pour Socket.io
    const serverUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connecté:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket déconnecté:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erreur de connexion Socket:', error.message);
    });

    return this.socket;
  }

  // ... (reste du code identique)
  
  // Déconnecter
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('❌ Socket déconnecté');
    }
  }

  // Envoyer un message
  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  // Marquer comme lu
  markAsRead(conversationId) {
    if (this.socket) {
      this.socket.emit('mark_as_read', { conversationId });
    }
  }

  // Indiquer que l'utilisateur tape
  startTyping(recipientId, conversationId) {
    if (this.socket) {
      this.socket.emit('typing', { recipientId, conversationId });
    }
  }

  // Arrêter l'indicateur de frappe
  stopTyping(recipientId, conversationId) {
    if (this.socket) {
      this.socket.emit('stop_typing', { recipientId, conversationId });
    }
  }

  // Rejoindre une conversation
  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  // Quitter une conversation
  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Écouter les nouveaux messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
      this.listeners.set('new_message', callback);
    }
  }

  // Écouter la confirmation d'envoi
  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
      this.listeners.set('message_sent', callback);
    }
  }

  // Écouter les erreurs de message
  onMessageError(callback) {
    if (this.socket) {
      this.socket.on('message_error', callback);
      this.listeners.set('message_error', callback);
    }
  }

  // Écouter quand quelqu'un tape
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners.set('user_typing', callback);
    }
  }

  // Écouter quand quelqu'un arrête de taper
  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
      this.listeners.set('user_stop_typing', callback);
    }
  }

  // Écouter quand des messages sont lus
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messages_read', callback);
      this.listeners.set('messages_read', callback);
    }
  }

  // Écouter quand un utilisateur se connecte
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user_online', callback);
      this.listeners.set('user_online', callback);
    }
  }

  // Écouter quand un utilisateur se déconnecte
  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user_offline', callback);
      this.listeners.set('user_offline', callback);
    }
  }

  // Retirer tous les listeners
  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callback, event) => {
        this.socket.off(event, callback);
      });
      this.listeners.clear();
    }
  }

  // Retirer un listener spécifique
  removeListener(event) {
    if (this.socket && this.listeners.has(event)) {
      const callback = this.listeners.get(event);
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  // Vérifier si connecté
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton
const socketService = new SocketService();
export default socketService;