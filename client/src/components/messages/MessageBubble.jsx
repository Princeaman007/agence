import { useState } from 'react';
import { FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const MessageBubble = ({ message, isOwn, onDelete }) => {
  const [showOptions, setShowOptions] = useState(false);

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: fr 
    });
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      onDelete(message._id);
    }
  };

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className={`flex items-end max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar de l'expéditeur (seulement pour les messages reçus) */}
        {!isOwn && (
          <div className="flex-shrink-0 mr-2">
            <img
              src={message.sender?.profilePhoto || '/default-avatar.png'}
              alt={message.sender?.firstName}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col">
          {/* Bulle de message */}
          <div
            className={`
              relative px-4 py-2 rounded-2xl shadow-sm
              ${isOwn 
                ? 'bg-primary-500 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }
            `}
          >
            {/* Contenu du message */}
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Heure et statut de lecture */}
            <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
              <span>{formatTime(message.createdAt)}</span>
              
              {/* Indicateur de lecture (seulement pour les messages envoyés) */}
              {isOwn && (
                <span>
                  {message.isRead ? (
                    <FaCheckDouble className="text-blue-300" />
                  ) : (
                    <FaCheck className="text-white/60" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Options (supprimer) - apparaît au survol */}
          {isOwn && showOptions && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-500 hover:text-red-700 mt-1 self-end flex items-center space-x-1"
            >
              <FaTrash className="text-xs" />
              <span>Supprimer</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;