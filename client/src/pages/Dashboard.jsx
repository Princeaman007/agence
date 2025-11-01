import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaEnvelope, FaEye, FaUserCheck, FaChartLine, FaClock, FaFire } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileCard from '../components/dashboard/ProfileCard';
import UpgradeBanner from '../components/dashboard/UpgradeBanner';
import { useAuthStore } from '../store/useStore';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [stats, setStats] = useState({
    profileViews: 0,
    likes: 0,
    messages: 0,
    matches: 0
  });

  // Vérifier si l'utilisateur est Premium
  const isPremium = user?.accountType === 'premium' || user?.accountType === 'vip';

  // Limites pour utilisateurs gratuits
  const dailyMessageLimit = user?.dailyMessagesLimit || 5;
  const dailyMessagesUsed = user?.dailyMessagesCount || 0;
  const messagesRemaining = dailyMessageLimit - dailyMessagesUsed;

  const dailyProfileLimit = user?.dailyProfileViewsLimit || 10;
  const dailyProfilesViewed = user?.dailyProfileViewsCount || 0;
  const profilesRemaining = dailyProfileLimit - dailyProfilesViewed;

  useEffect(() => {
    loadDashboardData();
  }, []);

 const loadDashboardData = async () => {
  try {
    setLoading(true);

    console.log('🔍 Début chargement Dashboard');
    console.log('👤 User actuel:', user);
    console.log('🎯 isPremium:', isPremium);

    // Récupérer les profils suggérés depuis la base de données
    const profilesResponse = await userService.searchUsers({
      limit: isPremium ? 12 : 6,
      page: 1
    });

    console.log('📦 Réponse COMPLÈTE API:', profilesResponse);
    console.log('✅ Success:', profilesResponse.success);
    console.log('📊 Data:', profilesResponse.data);
    console.log('👥 Users:', profilesResponse.data?.users);
    console.log('🔢 Nombre de users:', profilesResponse.data?.users?.length);

    if (profilesResponse.success) {
      console.log('✅ Profils chargés:', profilesResponse.data.users.length);
      setSuggestedProfiles(profilesResponse.data.users);
    } else {
      console.error('❌ Erreur API:', profilesResponse.message);
      toast.error('Erreur lors du chargement des profils');
    }

    // Stats utilisateur
    setStats({
      profileViews: user?.profileViews || 0,
      likes: user?.likesReceived || 0,
      messages: dailyMessagesUsed,
      matches: user?.matches || 0
    });

  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE:', error);
    console.error('❌ Message:', error.message);
    console.error('❌ Response:', error.response);
    console.error('❌ Response data:', error.response?.data);
    toast.error('Erreur lors du chargement des profils');
  } finally {
    setLoading(false);
  }
};

  const handleLike = async (profileId) => {
    try {
      toast.success('Profil liké ! 💕');
      setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
    } catch (error) {
      console.error('Erreur lors du like:', error);
      toast.error('Erreur lors du like');
    }
  };

  const handleMessage = (profileId) => {
    // if (!isPremium && messagesRemaining <= 0) {
    //   toast.error('Limite de messages atteinte pour aujourd\'hui');
    //   return;
    // }
    
    // toast.success('Redirection vers la conversation...');
  };

  return (
    <DashboardLayout>
      {/* Header avec salutation */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bonjour {user?.firstName} ! 👋
        </h1>
        <p className="text-gray-600">
          {isPremium 
            ? 'Bienvenue dans votre espace Premium. Profitez de toutes les fonctionnalités !'
            : 'Découvrez les profils qui vous correspondent aujourd\'hui.'
          }
        </p>
      </div>

      {/* Alerte si email non vérifié */}
      {!user?.isEmailVerified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Vérifiez votre email pour débloquer toutes les fonctionnalités.{' '}
                <Link to="/verify-email-notice" className="font-semibold underline">
                  Renvoyer l'email
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bannière Upgrade pour utilisateurs gratuits */}
      {!isPremium && (
        <UpgradeBanner 
          type="compact" 
          limitation={`${messagesRemaining} messages restants aujourd'hui`}
        />
      )}

      {/* Statistiques en cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Vues du profil */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Vues du profil</p>
              <p className="text-3xl font-bold text-gray-900">{stats.profileViews}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaEye className="text-2xl text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Cette semaine</p>
        </div>

        {/* Likes */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Likes reçus</p>
              <p className="text-3xl font-bold text-gray-900">{stats.likes}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <FaHeart className="text-2xl text-pink-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total</p>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Messages</p>
              <p className="text-3xl font-bold text-gray-900">
                {isPremium ? '∞' : `${messagesRemaining}/${dailyMessageLimit}`}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaEnvelope className="text-2xl text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isPremium ? 'Illimités' : 'Restants aujourd\'hui'}
          </p>
        </div>

        {/* Matchs */}
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Matchs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.matches}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaUserCheck className="text-2xl text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Compatibles</p>
        </div>
      </div>

      {/* Section Profil Incomplet */}
      {(!user?.bio || !user?.profilePhoto) && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Complétez votre profil</h3>
              <p className="text-blue-100 mb-4">
                Les profils complets reçoivent 3x plus de likes !
              </p>
              <div className="flex items-center space-x-4">
                {!user?.profilePhoto && (
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    📸 Photo manquante
                  </div>
                )}
                {!user?.bio && (
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    ✍️ Bio manquante
                  </div>
                )}
              </div>
            </div>
            <Link
              to={`/profile/${user?._id}`}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Compléter
            </Link>
          </div>
        </div>
      )}

      {/* Profils suggérés */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FaFire className="text-2xl text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              Profils suggérés pour vous
            </h2>
          </div>
          {!isPremium && (
            <span className="text-sm text-gray-600">
              {profilesRemaining}/{dailyProfileLimit} profils restants aujourd'hui
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : suggestedProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedProfiles.map((profile) => (
              <ProfileCard
                key={profile._id}
                user={profile}
                onLike={handleLike}
                onMessage={handleMessage}
                canMessage={isPremium || messagesRemaining > 0}
                isPremiumUser={isPremium}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <FaClock className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Aucun profil disponible pour le moment
            </h3>
            <p className="text-gray-600 mb-4">
              Revenez plus tard pour découvrir de nouveaux profils !
            </p>
            {!isPremium && (
              <Link to="/pricing" className="btn-primary inline-block">
                Passer à Premium pour des profils illimités
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Bannière Premium complète en bas */}
      {!isPremium && suggestedProfiles.length > 0 && (
        <UpgradeBanner type="full" />
      )}

      {/* Section Conseils */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <FaChartLine className="mr-3 text-primary-500" />
          Conseils pour améliorer votre profil
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">Ajoutez au moins 3 photos de qualité</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">Rédigez une bio authentique et personnelle</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">Complétez le test de compatibilité</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span className="text-gray-700">Soyez actif : connectez-vous régulièrement</span>
          </li>
        </ul>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;