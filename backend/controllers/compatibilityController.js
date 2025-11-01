import CompatibilityTest from '../models/CompatibilityTest.js';
import User from '../models/User.js';

// @desc    Soumettre un test de compatibilité
// @route   POST /api/compatibility/submit
// @access  Private
export const submitTest = async (req, res) => {
  try {
    const userId = req.user._id;

    // Vérifier si l'utilisateur a déjà un test
    let test = await CompatibilityTest.findOne({ userId });

    if (test) {
      // Mettre à jour le test existant
      test = await CompatibilityTest.findOneAndUpdate(
        { userId },
        {
          ...req.body,
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
    } else {
      // Créer un nouveau test
      test = await CompatibilityTest.create({
        userId,
        ...req.body,
        isCompleted: true,
        completedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Test de compatibilité enregistré avec succès',
      data: test
    });
  } catch (error) {
    console.error('Erreur submitTest:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement du test',
      error: error.message
    });
  }
};

// @desc    Obtenir le test de l'utilisateur connecté
// @route   GET /api/compatibility/my-test
// @access  Private
export const getMyTest = async (req, res) => {
  try {
    const userId = req.user._id;

    const test = await CompatibilityTest.findOne({ userId });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Aucun test trouvé. Veuillez compléter le test de compatibilité.'
      });
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Erreur getMyTest:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du test',
      error: error.message
    });
  }
};

// @desc    Calculer la compatibilité avec un utilisateur spécifique
// @route   GET /api/compatibility/calculate/:userId
// @access  Private
export const calculateCompatibility = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    // Vérifier que l'utilisateur cible existe
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les deux tests
    const [currentTest, targetTest] = await Promise.all([
      CompatibilityTest.findOne({ userId: currentUserId }),
      CompatibilityTest.findOne({ userId: targetUserId })
    ]);

    if (!currentTest) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez d\'abord compléter votre test de compatibilité'
      });
    }

    if (!targetTest) {
      return res.status(400).json({
        success: false,
        message: 'Cet utilisateur n\'a pas encore complété son test de compatibilité'
      });
    }

    // Calculer la compatibilité
    const compatibility = CompatibilityTest.calculateCompatibility(currentTest, targetTest);

    res.status(200).json({
      success: true,
      data: {
        targetUser: {
          _id: targetUser._id,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          profilePhoto: targetUser.profilePhoto,
          age: targetUser.age
        },
        compatibility
      }
    });
  } catch (error) {
    console.error('Erreur calculateCompatibility:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul de compatibilité',
      error: error.message
    });
  }
};

// @desc    Obtenir les meilleurs matchs
// @route   GET /api/compatibility/matches
// @access  Private
export const getMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, minScore = 50 } = req.query;

    // Vérifier que l'utilisateur a complété son test
    const currentTest = await CompatibilityTest.findOne({ userId });
    if (!currentTest) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez d\'abord compléter votre test de compatibilité'
      });
    }

    // Récupérer tous les tests complétés (sauf celui de l'utilisateur)
    const allTests = await CompatibilityTest.find({
      userId: { $ne: userId },
      isCompleted: true
    }).populate('userId', 'firstName lastName profilePhoto dateOfBirth gender location bio relationshipGoal accountType isEmailVerified');

    // Calculer la compatibilité avec chaque utilisateur
    const matches = [];
    for (const test of allTests) {
      if (!test.userId) continue; // Skip si l'utilisateur a été supprimé

      const compatibility = CompatibilityTest.calculateCompatibility(currentTest, test);
      
      if (compatibility.score >= minScore) {
        matches.push({
          user: test.userId,
          compatibility,
          testCompletedAt: test.completedAt
        });
      }
    }

    // Trier par score de compatibilité (décroissant)
    matches.sort((a, b) => b.compatibility.score - a.compatibility.score);

    // Limiter les résultats
    const limitedMatches = matches.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        matches: limitedMatches,
        total: matches.length,
        displayed: limitedMatches.length
      }
    });
  } catch (error) {
    console.error('Erreur getMatches:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des matchs',
      error: error.message
    });
  }
};

// @desc    Obtenir les détails de compatibilité détaillés
// @route   GET /api/compatibility/details/:userId
// @access  Private (Premium/VIP)
export const getCompatibilityDetails = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    // Vérifier l'accès Premium/VIP
    if (req.user.accountType === 'gratuit') {
      return res.status(403).json({
        success: false,
        message: 'Cette fonctionnalité est réservée aux membres Premium et VIP'
      });
    }

    // Récupérer les deux tests
    const [currentTest, targetTest] = await Promise.all([
      CompatibilityTest.findOne({ userId: currentUserId }),
      CompatibilityTest.findOne({ userId: targetUserId }).populate('userId', 'firstName lastName profilePhoto')
    ]);

    if (!currentTest || !targetTest) {
      return res.status(400).json({
        success: false,
        message: 'Tests de compatibilité incomplets'
      });
    }

    // Calculer les scores détaillés par catégorie
    const personalityScore = calculateCategoryScore(currentTest.personality, targetTest.personality, 'personality');
    const valuesScore = calculateCategoryScore(currentTest.values, targetTest.values, 'values');
    const lifestyleScore = calculateCategoryScore(currentTest.lifestyle, targetTest.lifestyle, 'lifestyle');
    const lifeGoalsScore = calculateCategoryScore(currentTest.lifeGoals, targetTest.lifeGoals, 'lifeGoals');

    const overallCompatibility = CompatibilityTest.calculateCompatibility(currentTest, targetTest);

    res.status(200).json({
      success: true,
      data: {
        targetUser: targetTest.userId,
        overall: overallCompatibility,
        breakdown: {
          personality: personalityScore,
          values: valuesScore,
          lifestyle: lifestyleScore,
          lifeGoals: lifeGoalsScore
        },
        strengths: identifyStrengths(currentTest, targetTest),
        challenges: identifyChallenges(currentTest, targetTest)
      }
    });
  } catch (error) {
    console.error('Erreur getCompatibilityDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails',
      error: error.message
    });
  }
};

// Fonction helper pour calculer le score d'une catégorie
function calculateCategoryScore(category1, category2, type) {
  if (!category1 || !category2) return { score: 0, details: {} };

  let score = 0;
  let maxScore = 0;
  const details = {};

  if (type === 'personality' || type === 'values') {
    // Pour les scores numériques
    Object.keys(category1).forEach(key => {
      if (category1[key] && category2[key]) {
        const diff = Math.abs(category1[key] - category2[key]);
        const itemScore = (10 - diff) * 10;
        details[key] = {
          yours: category1[key],
          theirs: category2[key],
          compatibility: Math.round(itemScore)
        };
        score += itemScore;
        maxScore += 100;
      }
    });
  } else {
    // Pour les enums (lifestyle, lifeGoals)
    Object.keys(category1).forEach(key => {
      if (category1[key] && category2[key]) {
        const match = category1[key] === category2[key];
        details[key] = {
          yours: category1[key],
          theirs: category2[key],
          match
        };
        if (match) score += 100;
        maxScore += 100;
      }
    });
  }

  return {
    score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    details
  };
}

// Identifier les forces de la compatibilité
function identifyStrengths(test1, test2) {
  const strengths = [];

  // Vérifier les valeurs communes élevées
  if (test1.values && test2.values) {
    Object.keys(test1.values).forEach(key => {
      if (test1.values[key] >= 8 && test2.values[key] >= 8) {
        strengths.push(`Vous accordez tous les deux beaucoup d'importance à ${translateValue(key)}`);
      }
    });
  }

  // Vérifier les objectifs de vie alignés
  if (test1.lifeGoals && test2.lifeGoals) {
    if (test1.lifeGoals.wantsChildren === test2.lifeGoals.wantsChildren) {
      strengths.push('Vous partagez la même vision concernant les enfants');
    }
    if (test1.lifeGoals.wantsMarriage === test2.lifeGoals.wantsMarriage) {
      strengths.push('Vous avez les mêmes attentes concernant le mariage');
    }
  }

  return strengths;
}

// Identifier les défis potentiels
function identifyChallenges(test1, test2) {
  const challenges = [];

  // Vérifier les dealbreakers
  if (test1.dealbreakers && test2.dealbreakers) {
    Object.keys(test1.dealbreakers).forEach(key => {
      if (test1.dealbreakers[key] || test2.dealbreakers[key]) {
        challenges.push(`Divergence sur ${translateDealbreaker(key)}`);
      }
    });
  }

  // Vérifier les grandes différences de personnalité
  if (test1.personality && test2.personality) {
    Object.keys(test1.personality).forEach(key => {
      const diff = Math.abs(test1.personality[key] - test2.personality[key]);
      if (diff >= 7) {
        challenges.push(`Différence significative en ${translatePersonality(key)}`);
      }
    });
  }

  return challenges;
}

// Fonctions de traduction
function translateValue(key) {
  const translations = {
    family: 'la famille',
    career: 'la carrière',
    adventure: 'l\'aventure',
    stability: 'la stabilité',
    spirituality: 'la spiritualité',
    creativity: 'la créativité'
  };
  return translations[key] || key;
}

function translateDealbreaker(key) {
  const translations = {
    smoking: 'le tabagisme',
    pets: 'les animaux de compagnie',
    differentReligion: 'les différences religieuses',
    longDistance: 'la distance géographique',
    childrenFromPrevious: 'les enfants d\'une relation précédente'
  };
  return translations[key] || key;
}

function translatePersonality(key) {
  const translations = {
    openness: 'ouverture d\'esprit',
    conscientiousness: 'conscience professionnelle',
    extraversion: 'extraversion',
    agreeableness: 'amabilité',
    neuroticism: 'neuroticisme'
  };
  return translations[key] || key;
}

export default {
  submitTest,
  getMyTest,
  calculateCompatibility,
  getMatches,
  getCompatibilityDetails
};