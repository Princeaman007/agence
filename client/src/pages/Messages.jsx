import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ConversationList from '../components/messages/ConversationList';
import ChatWindow from '../components/messages/ChatWindow';
import UpgradeBanner from '../components/dashboard/UpgradeBanner';
import { useAuthStore } from '../store/useStore';
import { messageService } from '../services/messageService';
import socketService from '../services/socketService';
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const isPremium = user?.accountType === 'premium' || user?.accountType === 'vip';

  useEffect(() => {
    initializeMessaging();

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  // ✅ MODIFIÉ : Gérer l'ouverture automatique SANS attendre conversations.length
  useEffect(() => {
    console.log('🔍 Vérification ouverture auto...');
    console.log('🔍 location.state:', location.state);
    console.log('🔍 selectedUserId:', location.state?.selectedUserId);
    console.log('🔍 userName:', location.state?.userName);
    console.log('🔍 conversations.length:', conversations.length);
    
    if (location.state?.selectedUserId && !loading) { // ✅ Attendre juste que loading soit false
      console.log('✅ Conditions remplies, appel handleStartConversation');
      handleStartConversation(
        location.state.selectedUserId,
        location.state.userName,
        location.state.userPhoto
      );
      
      // Nettoyer le state
      window.history.replaceState({}, document.title);
    } else {
      console.log('❌ Conditions non remplies:', {
        hasUserId: !!location.state?.selectedUserId,
        isLoading: loading
      });
    }
  }, [location.state?.selectedUserId, loading]); // ✅ Dépend de loading, pas de conversations.length

  const initializeMessaging = async () => {
    try {
      setLoading(true);
      console.log('🚀 Initialisation messaging...');

      const token = localStorage.getItem('token');
      if (!socketService.isConnected() && token) {
        socketService.connect(token);
      }

      await Promise.all([
        loadConversations(),
        loadLimits()
      ]);

      setupSocketListeners();

    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      console.log('📥 Chargement conversations...');
      const response = await messageService.getConversations();
      console.log('✅ Conversations chargées:', response.data);
      setConversations(response.data || []); // ✅ Fallback sur tableau vide
    } catch (error) {
      console.error('❌ Erreur chargement conversations:', error);
      setConversations([]); // ✅ Assurer qu'on a toujours un tableau
    }
  };

  const loadLimits = async () => {
    try {
      const response = await messageService.getMessageLimits();
      setLimits(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des limites:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.onNewMessage((data) => {
      loadConversations();
      
      if (!selectedConversation || selectedConversation._id !== data.conversationId) {
        toast.success(`Nouveau message de ${data.message.sender.firstName}`);
      }
    });

    socketService.onUserOnline((data) => {
      setOnlineUsers(prev => [...prev, data.userId]);
    });

    socketService.onUserOffline((data) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });
  };

  const handleStartConversation = async (userId, userName, userPhoto) => {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 handleStartConversation appelée');
      console.log('🎯 userId:', userId);
      console.log('🎯 userName:', userName);
      console.log('🎯 userPhoto:', userPhoto);
      console.log('🎯 conversations actuelles:', conversations);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Chercher si une conversation existe déjà
      const existingConv = conversations.find(conv => {
        console.log('🔍 Comparaison:', conv.participant?._id, 'vs', userId);
        return conv.participant?._id === userId;
      });

      if (existingConv) {
        console.log('✅ Conversation existante trouvée:', existingConv);
        setSelectedConversation(existingConv);
        toast.success('Conversation ouverte !');
      } else {
        console.log('🆕 Création nouvelle conversation temporaire');
        
        const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
        
        const newConversation = {
          _id: `temp-${userId}`,
          participant: {
            _id: userId,
            firstName: userName?.split(' ')[0] || 'Utilisateur',
            lastName: userName?.split(' ')[1] || '',
            profilePhoto: userPhoto ? `${BASE_URL}${userPhoto}` : null,
            isOnline: false
          },
          lastMessage: null,
          unreadCount: 0,
          updatedAt: new Date()
        };
        
        console.log('🆕 Nouvelle conversation créée:', newConversation);
        setSelectedConversation(newConversation);
        setConversations(prev => [newConversation, ...prev]);
        toast.success('Nouvelle conversation !');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
    } catch (error) {
      console.error('❌ Erreur handleStartConversation:', error);
      toast.error('Erreur lors de l\'ouverture de la conversation');
    }
  };

  const handleSelectConversation = (conversation) => {
    console.log('👆 Conversation sélectionnée:', conversation);
    setSelectedConversation(conversation);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  const handleDeleteMessage = () => {
    loadConversations();
  };

  const showMobileView = selectedConversation ? 'chat' : 'list';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <FaEnvelope className="mr-3 text-primary-500" />
          Messages
        </h1>
        <p className="text-gray-600">
          {isPremium 
            ? 'Messages illimités avec votre abonnement Premium'
            : `${limits?.remaining || 0} messages restants aujourd'hui`
          }
        </p>
      </div>

      {/* Bannière upgrade pour utilisateurs gratuits */}
      {!isPremium && limits && limits.remaining <= 2 && (
        <div className="mb-6">
          <UpgradeBanner 
            type="compact" 
            limitation={`Plus que ${limits.remaining} message${limits.remaining > 1 ? 's' : ''} aujourd'hui`}
          />
        </div>
      )}

      {/* Layout principal */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
        <div className="flex h-full">
          <div className={`
            w-full lg:w-1/3 border-r border-gray-200 
            ${showMobileView === 'chat' ? 'hidden lg:block' : 'block'}
          `}>
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              currentUserId={user._id}
              onlineUsers={onlineUsers}
            />
          </div>

          <div className={`
            w-full lg:w-2/3 
            ${showMobileView === 'list' ? 'hidden lg:block' : 'block'}
          `}>
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                currentUser={user}
                onBack={handleBackToList}
                onDeleteMessage={handleDeleteMessage}
              />
            ) : (
              <div className="hidden lg:flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <FaEnvelope className="text-6xl mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
                <p className="text-center">
                  Choisissez une conversation dans la liste pour commencer à échanger
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section limites pour utilisateurs gratuits */}
      {!isPremium && limits && (
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <FaLock className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Limites de messagerie
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    Messages utilisés aujourd'hui: <strong>{limits.used}/{limits.limit}</strong>
                  </p>
                  <p>
                    Messages restants: <strong className="text-primary-600">{limits.remaining}</strong>
                  </p>
                  <p className="text-xs text-gray-600">
                    Les limites se réinitialisent chaque jour à minuit
                  </p>
                </div>
              </div>
            </div>
            <Link
              to="/pricing"
              className="btn-primary whitespace-nowrap"
            >
              Passer à Premium
            </Link>
          </div>
        </div>
      )}

      {/* Conseils */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          💡 Conseils pour de meilleures conversations
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Soyez respectueux et authentique dans vos échanges</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Posez des questions ouvertes pour mieux connaître l'autre personne</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Répondez dans un délai raisonnable pour maintenir l'intérêt</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>Évitez les messages trop courts ou impersonnels</span>
          </li>
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default Messages;