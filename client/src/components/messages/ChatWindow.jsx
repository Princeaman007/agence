import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaArrowLeft, FaEllipsisV, FaCircle, FaImage } from 'react-icons/fa';
import MessageBubble from './MessageBubble';
import { messageService } from '../../services/messageService';
import socketService from '../../services/socketService';
import toast from 'react-hot-toast';

const ChatWindow = ({ 
  conversation, 
  currentUser, 
  onBack,
  onDeleteMessage 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const chatContainerRef = useRef(null);

  const participant = conversation.participant;
  const isOnline = participant.isOnline;
  
  // ✅ Vérifier si c'est une conversation temporaire
  const isTemporaryConversation = conversation._id.startsWith('temp-');

  // Charger les messages
  useEffect(() => {
    loadMessages();
    
    // ✅ Rejoindre la conversation Socket.io seulement si ce n'est pas temporaire
    if (!isTemporaryConversation) {
      socketService.joinConversation(conversation._id);
      handleMarkAsRead();
    }

    return () => {
      if (!isTemporaryConversation) {
        socketService.leaveConversation(conversation._id);
      }
    };
  }, [conversation._id]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    socketService.onNewMessage((data) => {
      if (data.conversationId === conversation._id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        handleMarkAsRead();
      }
    });

    socketService.onMessageSent((data) => {
      if (data.conversationId === conversation._id) {
        scrollToBottom();
      }
    });

    socketService.onUserTyping((data) => {
      if (data.conversationId === conversation._id && data.userId !== currentUser._id) {
        setIsTyping(true);
      }
    });

    socketService.onUserStopTyping((data) => {
      if (data.conversationId === conversation._id) {
        setIsTyping(false);
      }
    });

    return () => {
      socketService.removeListener('new_message');
      socketService.removeListener('message_sent');
      socketService.removeListener('user_typing');
      socketService.removeListener('user_stop_typing');
    };
  }, [conversation._id, currentUser._id]);

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      // ✅ Si c'est une conversation temporaire, ne pas charger les messages
      if (isTemporaryConversation) {
        console.log('⚠️ Conversation temporaire, pas de messages à charger');
        setMessages([]); // Pas de messages pour l'instant
        return;
      }
      
      const response = await messageService.getMessages(conversation._id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      // ✅ Ne pas marquer comme lu si conversation temporaire
      if (isTemporaryConversation) {
        return;
      }
      
      await messageService.markAsRead(conversation._id);
      socketService.markAsRead(conversation._id);
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      // Créer un message temporaire optimiste
      const tempMessage = {
        _id: Date.now().toString(),
        content: messageContent,
        sender: currentUser,
        recipient: participant,
        createdAt: new Date(),
        isRead: false,
        conversationId: conversation._id
      };

      // Ajouter le message temporaire immédiatement
      setMessages(prev => [...prev, tempMessage]);

      // ✅ Envoyer via HTTP pour persistance (créera la vraie conversation)
      const response = await messageService.sendMessage(participant._id, messageContent);
      
      console.log('✅ Message envoyé, réponse:', response);

      // ✅ Si c'était une conversation temporaire, on met à jour avec le vrai ID
      if (isTemporaryConversation && response.data?.conversation) {
        console.log('🔄 Mise à jour avec vraie conversation:', response.data.conversation);
        // La page Messages rechargera automatiquement les conversations
      }

      // Envoyer via Socket.io pour temps réel (si pas temporaire)
      if (!isTemporaryConversation) {
        socketService.sendMessage({
          recipientId: participant._id,
          content: messageContent,
          conversationId: conversation._id
        });

        // Arrêter l'indicateur de frappe
        socketService.stopTyping(participant._id, conversation._id);
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
      
      // Retirer le message temporaire en cas d'erreur
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(messageContent); // Restaurer le texte
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // ✅ Ne pas notifier typing si conversation temporaire
    if (isTemporaryConversation) return;

    // Notifier que l'utilisateur tape
    socketService.startTyping(participant._id, conversation._id);

    // Arrêter l'indicateur après 3 secondes d'inactivité
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(participant._id, conversation._id);
    }, 3000);
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      toast.success('Message supprimé');
      if (onDeleteMessage) {
        onDeleteMessage(messageId);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du message');
    }
  };

  const handleArchive = async () => {
    // ✅ Ne pas archiver si conversation temporaire
    if (isTemporaryConversation) {
      toast.error('Impossible d\'archiver une conversation vide');
      return;
    }

    if (window.confirm('Archiver cette conversation ?')) {
      try {
        await messageService.archiveConversation(conversation._id);
        toast.success('Conversation archivée');
        onBack();
      } catch (error) {
        console.error('Erreur lors de l\'archivage:', error);
        toast.error('Erreur lors de l\'archivage');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          {/* Bouton retour (mobile) */}
          <button
            onClick={onBack}
            className="lg:hidden text-gray-600 hover:text-gray-900 mr-2"
          >
            <FaArrowLeft />
          </button>

          {/* Avatar */}
          <div className="relative">
            <img
              src={participant.profilePhoto || '/default-avatar.png'}
              alt={participant.firstName}
              className="w-12 h-12 rounded-full object-cover"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>

          {/* Nom et statut */}
          <div>
            <h3 className="font-semibold text-gray-900">
              {participant.firstName} {participant.lastName}
            </h3>
            <div className="flex items-center text-sm">
              {isTyping ? (
                <span className="text-primary-500 italic">Écrit...</span>
              ) : isOnline ? (
                <>
                  <FaCircle className="text-green-500 text-xs mr-1" />
                  <span className="text-green-600">En ligne</span>
                </>
              ) : (
                <span className="text-gray-500">Hors ligne</span>
              )}
            </div>
          </div>
        </div>

        {/* Menu options */}
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <FaEllipsisV />
          </button>

          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={handleArchive}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
              >
                Archiver la conversation
              </button>
              <button
                onClick={() => {/* Bloquer l'utilisateur */}}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
              >
                Bloquer l'utilisateur
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zone des messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : messages.length > 0 ? (
          <div>
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.sender._id === currentUser._id}
                onDelete={handleDeleteMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg mb-2">Aucun message pour le moment</p>
            <p className="text-sm">Envoyez un message pour démarrer la conversation !</p>
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          {/* Bouton image (désactivé pour l'instant) */}
          <button
            type="button"
            className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            disabled
          >
            <FaImage />
          </button>

          {/* Champ de texte */}
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
            disabled={sending}
          />

          {/* Bouton envoyer */}
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`
              p-3 rounded-lg transition-colors
              ${newMessage.trim() && !sending
                ? 'bg-primary-500 text-white hover:bg-primary-600' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;