import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Heart, 
  MessageCircle, 
  Ban, 
  Edit,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Ruler,
  Target,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { userService } from '../../services/userService'; 
import { useAuthStore } from '../../store/useStore';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  // ✅ CORRECTION : Utiliser VITE_BASE_URL pour les images
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // ✅ Vérifier que l'ID est valide
      if (!id || id === 'undefined') {
        toast.error('ID de profil invalide');
        navigate('/dashboard');
        return;
      }

      const response = await userService.getProfile(id);
      
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
      
      if (error.response?.data?.limitReached) {
        toast.error('Limite quotidienne de vues atteinte');
        navigate('/pricing');
      } else if (error.response?.status === 404) {
        toast.error('Profil non trouvé');
        navigate('/dashboard');
      } else {
        toast.error(error.response?.data?.message || 'Erreur lors du chargement du profil');
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVEAU : Gérer le clic sur Message
  const handleSendMessage = () => {
    navigate('/dashboard/messages', {
      state: {
        selectedUserId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        userPhoto: user.profilePhoto
      }
    });
  };

  const handleBlock = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir bloquer cet utilisateur ?')) {
      return;
    }

    try {
      setBlocking(true);
      const response = await userService.blockUser(id);
      
      if (response.success) {
        toast.success('Utilisateur bloqué');
        navigate('/dashboard/search');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Erreur lors du blocage');
    } finally {
      setBlocking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Profil non trouvé</p>
      </div>
    );
  }

  const defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"%3E%3Crect fill="%23e5e7eb" width="400" height="500"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="250" dx="120" text-anchor="start"%3EAucune photo%3C/text%3E%3C/svg%3E';
  
  const profileImage = user.profilePhoto ? `${BASE_URL}${user.profilePhoto}` : defaultImage;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Colonne gauche - Photos */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
              {/* Photo principale */}
              <div className="relative">
                <img
                  src={profileImage}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    console.error('Erreur chargement image Profile:', profileImage);
                    e.target.src = defaultImage;
                  }}
                />
                
                {/* Badge compte */}
                {user.accountType !== 'gratuit' && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold text-white ${
                    user.accountType === 'vip' 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-700'
                  }`}>
                    {user.accountType.toUpperCase()}
                  </div>
                )}
              </div>

              {/* Galerie photos */}
              {user.photos && user.photos.length > 1 && (
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Plus de photos ({user.photos.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {user.photos.slice(0, 6).map((photo) => (
                      <img
                        key={photo._id}
                        src={`${BASE_URL}${photo.url}`}
                        alt="Photo"
                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                        onError={(e) => {
                          console.error('Erreur chargement photo galerie:', `${BASE_URL}${photo.url}`);
                          e.target.src = defaultImage;
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Statistiques */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Eye className="w-4 h-4" />
                  <span>{user.profileViews || 0} vues</span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite - Informations */}
          <div className="md:col-span-2 space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-xl text-gray-600 mt-1">{user.age} ans</p>
                  
                  {user.location && (user.location.city || user.location.country) && (
                    <div className="flex items-center gap-2 text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {user.location.city && user.location.country
                          ? `${user.location.city}, ${user.location.country}`
                          : user.location.city || user.location.country}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Link
                      to="/edit-profile"
                      className="btn-primary flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Éditer
                    </Link>
                  ) : (
                    <>
                      {/* ✅ Bouton Message - MODIFIÉ */}
                      <button 
                        onClick={handleSendMessage}
                        className="btn-primary flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                      <button className="bg-red-50 text-red-500 p-3 rounded-lg hover:bg-red-100">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleBlock}
                        disabled={blocking}
                        className="bg-gray-100 text-gray-600 p-3 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                      >
                        <Ban className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">À propos</h2>
                  <p className="text-gray-600 whitespace-pre-line">{user.bio}</p>
                </div>
              )}
            </div>

            {/* Informations détaillées */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {user.relationshipGoal && (
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Recherche</p>
                      <p className="font-medium text-gray-800">
                        {user.relationshipGoal === 'relation_serieuse' && 'Relation sérieuse'}
                        {user.relationshipGoal === 'mariage' && 'Mariage'}
                        {user.relationshipGoal === 'amitie' && 'Amitié'}
                        {user.relationshipGoal === 'a_definir' && 'À définir'}
                      </p>
                    </div>
                  </div>
                )}

                {user.height && (
                  <div className="flex items-start gap-3">
                    <Ruler className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Taille</p>
                      <p className="font-medium text-gray-800">{user.height} cm</p>
                    </div>
                  </div>
                )}

                {user.education && (
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Éducation</p>
                      <p className="font-medium text-gray-800">{user.education}</p>
                    </div>
                  </div>
                )}

                {user.occupation && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Profession</p>
                      <p className="font-medium text-gray-800">{user.occupation}</p>
                    </div>
                  </div>
                )}

                {isOwnProfile && user.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium text-gray-800">{user.phone}</p>
                    </div>
                  </div>
                )}

                {isOwnProfile && user.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;