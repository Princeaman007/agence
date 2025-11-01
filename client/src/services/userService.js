import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Créer une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token à chaque requête
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

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// Services utilisateurs
export const userService = {
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getProfile:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur updateProfile:', error);
      throw error;
    }
  },

  uploadPhoto: async (formData) => {
    try {
      const response = await api.post('/users/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' 
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur uploadPhoto:', error);
      throw error;
    }
  },

  deletePhoto: async (photoId) => {
    try {
      const response = await api.delete(`/users/photo/${photoId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur deletePhoto:', error);
      throw error;
    }
  },

  setProfilePhoto: async (photoId) => {
    try {
      const response = await api.put(`/users/profile-photo/${photoId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur setProfilePhoto:', error);
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      const response = await api.post(`/users/block/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur blockUser:', error);
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await api.delete(`/users/block/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur unblockUser:', error);
      throw error;
    }
  },

  searchUsers: async (filters) => {
    try {
      const response = await api.get('/users/search', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Erreur searchUsers:', error);
      throw error;
    }
  }
};

// Services de messages
export const messageService = {
  getConversations: async () => {
    try {
      const response = await api.get('/messages/conversations');
      return response.data;
    } catch (error) {
      console.error('Erreur getConversations:', error);
      throw error;
    }
  },

  getMessages: async (conversationId) => {
    try {
      const response = await api.get(`/messages/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getMessages:', error);
      throw error;
    }
  },

  sendMessage: async (recipientId, content) => {
    try {
      const response = await api.post('/messages/send', { recipientId, content });
      return response.data;
    } catch (error) {
      console.error('Erreur sendMessage:', error);
      throw error;
    }
  },

  markAsRead: async (conversationId) => {
    try {
      const response = await api.put(`/messages/${conversationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Erreur markAsRead:', error);
      throw error;
    }
  }
};

// Services de compatibilité - NOUVEAUX
export const compatibilityService = {
  // Soumettre le test de compatibilité
  submitTest: async (testData) => {
    try {
      const response = await api.post('/compatibility/submit', testData);
      return response.data;
    } catch (error) {
      console.error('Erreur submitTest:', error);
      throw error;
    }
  },

  // Obtenir le test de l'utilisateur
  getMyTest: async () => {
    try {
      const response = await api.get('/compatibility/my-test');
      return response.data;
    } catch (error) {
      console.error('Erreur getMyTest:', error);
      throw error;
    }
  },

  // Calculer la compatibilité avec un utilisateur
  calculateCompatibility: async (userId) => {
    try {
      const response = await api.get(`/compatibility/calculate/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur calculateCompatibility:', error);
      throw error;
    }
  },

  // Obtenir les meilleurs matchs
  getMatches: async (params = {}) => {
    try {
      const response = await api.get('/compatibility/matches', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur getMatches:', error);
      throw error;
    }
  },

  // Obtenir les détails de compatibilité (Premium/VIP)
  getCompatibilityDetails: async (userId) => {
    try {
      const response = await api.get(`/compatibility/details/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur getCompatibilityDetails:', error);
      throw error;
    }
  }
};

// Services de rendez-vous (pour Premium/VIP)
export const appointmentService = {
  getAppointments: async () => {
    try {
      const response = await api.get('/appointments');
      return response.data;
    } catch (error) {
      console.error('Erreur getAppointments:', error);
      throw error;
    }
  },

  createAppointment: async (appointmentData) => {
    try {
      const response = await api.post('/appointments/create', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Erreur createAppointment:', error);
      throw error;
    }
  },

  cancelAppointment: async (appointmentId, reason) => {
    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Erreur cancelAppointment:', error);
      throw error;
    }
  }
};

export default api;