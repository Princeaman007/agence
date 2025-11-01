import { FaCircle, FaSearch, FaInbox } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ConversationList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  currentUserId,
  onlineUsers = []
}) => {
  const formatTime = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: fr 
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
        <FaInbox className="text-6xl mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold mb-2">Aucune conversation</h3>
        <p className="text-center text-sm">
          Commencez à discuter avec d'autres utilisateurs pour voir vos conversations ici.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
        
        {/* Barre de recherche */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Liste des conversations */}
      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => {
          const participant = conversation.participant;
          const isSelected = selectedConversation?._id === conversation._id;
          const isOnline = isUserOnline(participant._id);
          const hasUnread = conversation.unreadCount > 0;

          return (
            <div
              key={conversation._id}
              onClick={() => onSelectConversation(conversation)}
              className={`
                p-4 cursor-pointer transition-colors hover:bg-gray-50
                ${isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : 'border-l-4 border-transparent'}
              `}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar avec indicateur en ligne */}
                <div className="relative flex-shrink-0">
                  <img
                    src={participant.profilePhoto || '/default-avatar.png'}
                    alt={participant.firstName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>

                {/* Infos de la conversation */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-sm font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {participant.firstName} {participant.lastName}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(conversation.updatedAt)}
                    </span>
                  </div>

                  {/* Dernier message */}
                  {conversation.lastMessage && (
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {conversation.lastMessage.sender?.toString() === currentUserId 
                          ? 'Vous: ' 
                          : ''
                        }
                        {conversation.lastMessage.content}
                      </p>
                      
                      {/* Badge de messages non lus */}
                      {hasUnread && (
                        <span className="ml-2 flex-shrink-0 bg-primary-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Statut en ligne */}
                  {isOnline && (
                    <div className="flex items-center mt-1">
                      <FaCircle className="text-green-500 text-xs mr-1" />
                      <span className="text-xs text-green-600">En ligne</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;