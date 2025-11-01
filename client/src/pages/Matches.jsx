import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Heart, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ProfileCard from '../components/dashboard/ProfileCard';
import CompatibilityScore from '../components/CompatibilityScore';
import { compatibilityService } from '../services/userService';
import { useAuthStore } from '../store/useStore';
import toast from 'react-hot-toast';

const Matches = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [minScore, setMinScore] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  const [noTestCompleted, setNoTestCompleted] = useState(false);

  const isPremium = user?.accountType === 'premium' || user?.accountType === 'vip';

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    // Filtrer les matchs selon le score minimum
    const filtered = matches.filter(match => match.compatibility.score >= minScore);
    setFilteredMatches(filtered);
  }, [minScore, matches]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await compatibilityService.getMatches({
        limit: isPremium ? 50 : 20,
        minScore: 40
      });

      if (response.success) {
        setMatches(response.data.matches);
        setFilteredMatches(response.data.matches);
        setNoTestCompleted(false);
      }
    } catch (error) {
      console.error('Erreur chargement matchs:', error);
      if (error.response?.status === 400) {
        // L'utilisateur n'a pas complété son test
        // Pas de toast d'erreur, juste afficher l'écran d'invitation
        setNoTestCompleted(true);
      } else {
        toast.error('Erreur lors du chargement des matchs');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (profileId) => {
    toast.success('Profil liké ! 💕');
  };

  const handleMessage = (profileId) => {
    // Navigation vers messages
  };

  // Trier les matchs
  const sortMatchesByScore = () => {
    const sorted = [...filteredMatches].sort((a, b) => b.compatibility.score - a.compatibility.score);
    setFilteredMatches(sorted);
  };

  const sortMatchesByRecent = () => {
    const sorted = [...filteredMatches].sort((a, b) => 
      new Date(b.testCompletedAt) - new Date(a.testCompletedAt)
    );
    setFilteredMatches(sorted);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
          <p className="text-gray-600 mt-4">Recherche de vos matchs parfaits...</p>
        </div>
      </DashboardLayout>
    );
  }

  // ✅ NOUVEAU : Écran professionnel si l'utilisateur n'a pas complété le test
  if (noTestCompleted) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-3xl shadow-2xl overflow-hidden mb-8"
          >
            <div className="px-8 py-12 md:px-12 md:py-16 text-white relative">
              {/* Motif de fond */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 right-10 text-9xl">💕</div>
                <div className="absolute bottom-10 left-10 text-9xl">✨</div>
              </div>

              <div className="relative z-10 max-w-3xl">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-block mb-4"
                >
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold">
                    🎯 Nouvelle fonctionnalité
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
                >
                  Trouve ton match parfait grâce à la science
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 mb-8"
                >
                  Notre test de compatibilité basé sur la psychologie scientifique t'aide à rencontrer des personnes vraiment compatibles avec toi.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link
                    to="/compatibility-test"
                    className="group bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>🧠 Commencer le test</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
                  >
                    Plus tard
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">⏱️</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">5 min</div>
              <p className="text-gray-600">Durée du test</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">🔥</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{isPremium ? '50' : '20'}</div>
              <p className="text-gray-600">Profils compatibles</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <p className="text-gray-600">Taux de satisfaction</p>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Ce que tu vas découvrir
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  🧠
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Ton profil de personnalité</h3>
                  <p className="text-sm text-gray-600">Analyse scientifique basée sur le modèle Big Five utilisé par les psychologues</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  💕
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Tes meilleurs matchs</h3>
                  <p className="text-sm text-gray-600">Score de compatibilité personnalisé avec chaque profil</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  💎
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Tes valeurs et priorités</h3>
                  <p className="text-sm text-gray-600">Découvre ce qui compte vraiment pour toi dans une relation</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start space-x-4 p-4 rounded-xl hover:bg-primary-50 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl">
                  🎯
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Tes objectifs de vie</h3>
                  <p className="text-sm text-gray-600">Trouve quelqu'un qui partage ta vision du futur</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Comment ça marche ?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-2">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Réponds au test</h4>
                <p className="text-sm text-gray-600">25 questions rapides</p>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="text-3xl text-primary-300">→</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Analyse</h4>
                <p className="text-sm text-gray-600">Notre algorithme calcule</p>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="text-3xl text-primary-300">→</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Découvre</h4>
                <p className="text-sm text-gray-600">Tes meilleurs matchs</p>
              </div>
            </div>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="text-5xl mb-4">💬</div>
            <blockquote className="text-xl text-gray-700 italic mb-4">
              "Grâce au test de compatibilité, j'ai rencontré quelqu'un qui me correspond vraiment. On partage les mêmes valeurs et objectifs !"
            </blockquote>
            <div className="flex items-center justify-center space-x-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <span className="text-gray-600 font-medium">- Sophie, 28 ans</span>
            </div>
          </motion.div>

          {/* CTA Final */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <Link
              to="/compatibility-test"
              className="inline-block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Commencer maintenant - C'est gratuit !
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              🔒 100% confidentiel • ⏱️ 5 minutes • ✨ Résultats instantanés
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="w-10 h-10 text-red-500" />
                Vos Matchs
              </h1>
              <p className="text-gray-600">
                {filteredMatches.length} {filteredMatches.length > 1 ? 'personnes compatibles' : 'personne compatible'} avec votre profil
              </p>
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filtres
            </button>
          </div>
        </motion.div>

        {/* Panneau de filtres */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtrer les résultats
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filtre score minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score minimum : {minScore}%
                </label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={minScore}
                  onChange={(e) => setMinScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>40%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Trier par */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trier par
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={sortMatchesByScore}
                    className="flex-1 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                  >
                    Score
                  </button>
                  <button
                    onClick={sortMatchesByRecent}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Récent
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Matchs excellents</p>
                <p className="text-3xl font-bold text-green-900">
                  {matches.filter(m => m.compatibility.score >= 80).length}
                </p>
              </div>
              <Sparkles className="w-12 h-12 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Bons matchs</p>
                <p className="text-3xl font-bold text-blue-900">
                  {matches.filter(m => m.compatibility.score >= 60 && m.compatibility.score < 80).length}
                </p>
              </div>
              <Heart className="w-12 h-12 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Total matchs</p>
                <p className="text-3xl font-bold text-purple-900">
                  {matches.length}
                </p>
              </div>
              <Filter className="w-12 h-12 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Grille de matchs */}
        {filteredMatches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-xl shadow-md"
          >
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucun match trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de réduire le score minimum dans les filtres
            </p>
            {!isPremium && (
              <Link
                to="/pricing"
                className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600"
              >
                Passer à Premium pour plus de matchs
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match.user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="relative"
              >
                {/* Badge de compatibilité en overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <div className={`px-3 py-1 rounded-full font-bold text-white text-sm shadow-lg ${
                    match.compatibility.score >= 80
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : match.compatibility.score >= 60
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  }`}>
                    {match.compatibility.score}% compatible
                  </div>
                </div>

                {/* ProfileCard standard */}
                <ProfileCard
                  user={match.user}
                  onLike={handleLike}
                  onMessage={handleMessage}
                  canMessage={isPremium || true}
                  isPremiumUser={isPremium}
                />

                {/* Bouton voir détails compatibilité (Premium) */}
                {/* {isPremium && (
                  <Link
                    to={`/compatibility-details/${match.user._id}`}
                    className="block mt-3 text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    📊 Voir les détails de compatibilité
                  </Link>
                )} */}
              </motion.div>
            ))}
          </div>
        )}

        {/* Message si pas Premium */}
        {!isPremium && matches.length >= 20 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center"
          >
            <h3 className="text-2xl font-bold mb-3">
              ✨ Débloquez plus de matchs
            </h3>
            <p className="text-primary-100 mb-6">
              Passez à Premium pour voir jusqu'à 50 matchs compatibles
            </p>
            <Link
              to="/pricing"
              className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Voir les offres Premium
            </Link>
          </motion.div>
        )}

        {/* Refaire le test */}
        <div className="text-center mt-8">
          <Link
            to="/compatibility-test"
            className="text-gray-600 hover:text-primary-600 underline"
          >
            ↻ Refaire le test de compatibilité
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Matches;