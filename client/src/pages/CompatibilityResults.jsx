import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Heart, Users, Sparkles, TrendingUp } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import CompatibilityScore from '../components/CompatibilityScore';
import { compatibilityService } from '../services/userService';
import toast from 'react-hot-toast';

const CompatibilityResults = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(true);
  const [testData, setTestData] = useState(null);
  const [topMatches, setTopMatches] = useState([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      
      // Récupérer le test
      const testResponse = await compatibilityService.getMyTest();
      if (!testResponse.success) {
        toast.error('Veuillez d\'abord compléter le test');
        navigate('/compatibility-test');
        return;
      }
      
      setTestData(testResponse.data);

      // Animation de calcul
      setTimeout(() => setCalculating(false), 2000);

      // Récupérer les top matchs
      const matchesResponse = await compatibilityService.getMatches({ limit: 3, minScore: 60 });
      if (matchesResponse.success) {
        setTopMatches(matchesResponse.data.matches);
      }

    } catch (error) {
      console.error('Erreur chargement résultats:', error);
      toast.error('Erreur lors du chargement des résultats');
      navigate('/compatibility-test');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les scores moyens par catégorie
  const calculateCategoryScores = () => {
    if (!testData) return {};

    const personalityAvg = Object.values(testData.personality || {}).reduce((a, b) => a + b, 0) / 5;
    const valuesAvg = Object.values(testData.values || {}).reduce((a, b) => a + b, 0) / 6;

    return {
      personality: Math.round((personalityAvg / 10) * 100),
      values: Math.round((valuesAvg / 10) * 100),
      lifestyle: testData.lifestyle ? 75 : 0, // Simplifié
      lifeGoals: testData.lifeGoals ? 80 : 0 // Simplifié
    };
  };

  const categoryScores = testData ? calculateCategoryScores() : {};

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (calculating) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-16 h-16 text-primary-500" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-gray-900 mt-6"
          >
            Analyse de votre profil en cours...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 mt-2"
          >
            Calcul de vos compatibilités ✨
          </motion.p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header avec animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🎉 Votre profil est complet !
          </h1>
          <p className="text-gray-600 text-lg">
            Nous pouvons maintenant vous proposer les meilleurs matchs
          </p>
        </motion.div>

        {/* Résumé du profil */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 mb-8 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            Résumé de votre profil
          </h2>

          {/* Graphiques radar des catégories */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(categoryScores).map(([category, score], index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl p-6 text-center shadow-md"
              >
                <div className="text-4xl mb-3">
                  {category === 'personality' && '🧠'}
                  {category === 'values' && '💎'}
                  {category === 'lifestyle' && '🏡'}
                  {category === 'lifeGoals' && '🎯'}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 capitalize">
                  {category === 'personality' && 'Personnalité'}
                  {category === 'values' && 'Valeurs'}
                  {category === 'lifestyle' && 'Style de vie'}
                  {category === 'lifeGoals' && 'Objectifs'}
                </h3>
                <div className="text-3xl font-bold text-primary-600">
                  {score}%
                </div>
                <p className="text-xs text-gray-500 mt-1">Complété</p>
              </motion.div>
            ))}
          </div>

          {/* Traits principaux */}
          <div className="mt-8">
            <h3 className="font-semibold text-gray-900 mb-4">Vos traits dominants :</h3>
            <div className="flex flex-wrap gap-2">
              {testData.personality && Object.entries(testData.personality).map(([trait, value]) => {
                if (value >= 7) {
                  const labels = {
                    openness: 'Ouvert d\'esprit',
                    conscientiousness: 'Consciencieux',
                    extraversion: 'Extraverti',
                    agreeableness: 'Amical',
                    neuroticism: 'Sensible'
                  };
                  return (
                    <span
                      key={trait}
                      className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {labels[trait]}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </motion.div>

        {/* Top 3 matchs */}
        {topMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Vos 3 meilleurs matchs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topMatches.map((match, index) => (
                <motion.div
                  key={match.user._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-48">
                    <img
                      src={match.user.profilePhoto || '/default-avatar.svg'}
                      alt={`${match.user.firstName}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                        🏆 Top Match
                      </div>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {match.user.firstName} {match.user.lastName}
                    </h3>
                    
                    {/* Score de compatibilité */}
                    <div className="mb-4">
                      <CompatibilityScore
                        score={match.compatibility.score}
                        hasDealbreaker={match.compatibility.hasDealbreaker}
                        size="small"
                        showDetails={false}
                      />
                    </div>

                    <Link
                      to={`/profile/${match.user._id}`}
                      className="block w-full bg-primary-500 text-white text-center py-2 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                    >
                      Voir le profil
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA vers les matchs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 text-white text-center shadow-xl"
        >
          <Users className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-3">
            Découvrez tous vos matchs !
          </h2>
          <p className="text-primary-100 mb-6 text-lg">
            {topMatches.length > 0 
              ? `Nous avons trouvé ${topMatches.length} personnes très compatibles avec vous`
              : 'Explorez tous les profils compatibles avec votre personnalité'
            }
          </p>
          <Link
            to="/matches"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            Voir tous les matchs
          </Link>
        </motion.div>

        {/* Refaire le test */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8"
        >
          <Link
            to="/compatibility-test"
            className="text-gray-600 hover:text-primary-600 underline"
          >
            Modifier mes réponses
          </Link>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CompatibilityResults;