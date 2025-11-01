import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, UserCheck } from 'lucide-react';
import { FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ProfileCard = ({
  user,
  showActions = true,
  onLike,
  onMessage,
  canMessage = true,
  isPremiumUser = false
}) => {
  const navigate = useNavigate();

  console.log('🎨 ProfileCard rendu pour user:', user);

  // ✅ CORRECTION : Utiliser VITE_BASE_URL pour les images
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

  // Image par défaut SVG embarquée (évite les erreurs de chargement)
  const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"%3E%3Crect fill="%23e5e7eb" width="300" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" dy="200" dx="80" text-anchor="start"%3EAucune photo%3C/text%3E%3C/svg%3E';

  const profileImage = user?.profilePhoto
    ? `${BASE_URL}${user.profilePhoto}`
    : defaultImage;

  // Calculer l'âge
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = user?.dateOfBirth ? calculateAge(user.dateOfBirth) : user?.age;

  // ✅ MODIFIÉ : Navigation AVANT callback
  const handleMessageClick = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔵 BOUTON MESSAGE CLIQUÉ !');
    console.log('🔵 Timestamp:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Données user:');
    console.log('  - user._id:', user?._id);
    console.log('  - user.firstName:', user?.firstName);
    console.log('  - user.lastName:', user?.lastName);
    console.log('  - user.profilePhoto:', user?.profilePhoto);
    console.log('📦 Props:');
    console.log('  - canMessage:', canMessage);
    console.log('  - onMessage existe?', !!onMessage);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!canMessage) {
      console.log('❌ canMessage = false, arrêt ici');
      toast.error('Limite de messages atteinte pour aujourd\'hui');
      return;
    }

    console.log('✅ canMessage = true, on continue');

    // ✅ NAVIGATION D'ABORD (avant le callback)
    const navigationState = {
      selectedUserId: user?._id,
      userName: `${user?.firstName} ${user?.lastName}`,
      userPhoto: user?.profilePhoto
    };

    console.log('🚀 Navigation vers /dashboard/messages AVANT callback');
    console.log('📦 State de navigation:', navigationState);

    // Rediriger vers la page Messages avec l'ID de l'utilisateur
    navigate('/dashboard/messages', {
      state: navigationState
    });

    console.log('✅ navigate() appelé !');

    // ✅ CALLBACK APRÈS (pour les stats, etc.)
    if (onMessage) {
      console.log('📞 Appel du callback onMessage APRÈS navigation');
      onMessage(user?._id);
    } else {
      console.log('⚠️ Pas de callback onMessage fourni');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image de profil */}
      <Link to={`/profile/${user?._id}`}>
        <div className="relative h-64 overflow-hidden bg-gray-200">
          <img
            src={profileImage}
            alt={`${user?.firstName} ${user?.lastName}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              console.error('Erreur chargement image ProfileCard:', profileImage);
              e.target.src = defaultImage;
            }}
          />

          {/* Badge Premium/VIP */}
          {user?.accountType !== 'gratuit' && (
            <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${user?.accountType === 'vip'
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
              : 'bg-gradient-to-r from-purple-500 to-purple-700'
              }`}>
              {user?.accountType?.toUpperCase()}
            </div>
          )}

          {/* Badge Vérifié */}
          {user?.isEmailVerified && (
            <div className="absolute top-3 left-3 bg-blue-500 rounded-full p-1">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </Link>

      {/* Informations */}
      <div className="p-4">
        <Link to={`/profile/${user?._id}`}>
          <h3 className="text-xl font-bold text-gray-800 hover:text-primary-600 transition-colors">
            {user?.firstName} {user?.lastName}
          </h3>
        </Link>

        {age && (
          <p className="text-gray-600 text-sm mt-1">
            {age} ans
          </p>
        )}

        {/* Localisation */}
        {user?.location && (user.location.city || user.location.country) && (
          <div className="flex items-center text-gray-600 text-sm mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>
              {user.location.city && user.location.country
                ? `${user.location.city}, ${user.location.country}`
                : user.location.city || user.location.country}
            </span>
          </div>
        )}

        {/* Bio courte */}
        {user?.bio && (
          <p className="text-gray-600 text-sm mt-3 line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Type de relation */}
        {user?.relationshipGoal && (
          <div className="mt-3">
            <span className="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
              {user.relationshipGoal === 'relation_serieuse' && 'Relation sérieuse'}
              {user.relationshipGoal === 'mariage' && 'Mariage'}
              {user.relationshipGoal === 'amitie' && 'Amitié'}
              {user.relationshipGoal === 'a_definir' && 'À définir'}
            </span>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4 flex gap-2">
            <Link
              to={`/profile/${user?._id}`}
              className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors text-center font-medium"
            >
              Voir le profil
            </Link>

            {/* Bouton Like */}
            {onLike && (
              <button
                onClick={() => {
                  console.log('❤️ Bouton LIKE cliqué pour user:', user?._id);
                  onLike(user?._id);
                }}
                className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-100 transition-colors"
                title="Aimer"
              >
                <Heart className="w-5 h-5" />
              </button>
            )}

            {/* ✅ Bouton Message - MODIFIÉ */}
            <Link
              to="/dashboard/messages"
              state={{
                selectedUserId: user?._id,
                userName: `${user?.firstName} ${user?.lastName}`,
                userPhoto: user?.profilePhoto
              }}
              className="p-2 rounded-lg transition-colors bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center"
              title="Envoyer un message"
            >
              <FaEnvelope className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;