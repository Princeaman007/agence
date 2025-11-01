import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Créer une instance axios avec config
const api = axios.create({
  baseURL: `${API_URL}/messages`,  // ✅ Sans /api car déjà dans VITE_API_URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Une erreur est survenue';
    return Promise.reject({ message, ...error.response?.data });
  }
);

class MessageService {
  // Envoyer un message
  async sendMessage(recipientId, content, messageType = 'text') {
    return await api.post('/', {
      recipientId,
      content,
      messageType
    });
  }

  // Obtenir toutes les conversations
  async getConversations() {
    return await api.get('/conversations');
  }

  // Obtenir les messages d'une conversation
  async getMessages(conversationId, page = 1, limit = 50) {
    return await api.get(`/conversation/${conversationId}`, {
      params: { page, limit }
    });
  }

  // Marquer les messages comme lus
  async markAsRead(conversationId) {
    return await api.put(`/conversation/${conversationId}/read`);
  }

  // Supprimer un message
  async deleteMessage(messageId) {
    return await api.delete(`/${messageId}`);
  }

  // Archiver une conversation
  async archiveConversation(conversationId) {
    return await api.put(`/conversation/${conversationId}/archive`);
  }

  // Obtenir les limites de messagerie
  async getMessageLimits() {
    return await api.get('/limits');
  }
}

const messageService = new MessageService();
export { messageService };
export default messageService;