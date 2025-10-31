import mongoose from 'mongoose';

const compatibilityTestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Réponses aux questions de personnalité
  personality: {
    // Big Five Personality Traits
    openness: {
      type: Number,
      min: 1,
      max: 10
    },
    conscientiousness: {
      type: Number,
      min: 1,
      max: 10
    },
    extraversion: {
      type: Number,
      min: 1,
      max: 10
    },
    agreeableness: {
      type: Number,
      min: 1,
      max: 10
    },
    neuroticism: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // Valeurs personnelles
  values: {
    family: {
      type: Number,
      min: 1,
      max: 10
    },
    career: {
      type: Number,
      min: 1,
      max: 10
    },
    adventure: {
      type: Number,
      min: 1,
      max: 10
    },
    stability: {
      type: Number,
      min: 1,
      max: 10
    },
    spirituality: {
      type: Number,
      min: 1,
      max: 10
    },
    creativity: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  
  // Style de vie
  lifestyle: {
    social: {
      type: String,
      enum: ['introvert', 'ambivert', 'extrovert']
    },
    activity: {
      type: String,
      enum: ['sedentaire', 'modere', 'tres_actif']
    },
    routine: {
      type: String,
      enum: ['flexible', 'structure', 'tres_structure']
    },
    spending: {
      type: String,
      enum: ['econome', 'equilibre', 'genereux']
    }
  },
  
  // Objectifs de vie
  lifeGoals: {
    wantsChildren: {
      type: String,
      enum: ['oui', 'non', 'peut_etre', 'deja_parent']
    },
    wantsMarriage: {
      type: String,
      enum: ['oui', 'non', 'peut_etre']
    },
    careerAmbition: {
      type: String,
      enum: ['tres_ambitieux', 'equilibre', 'vie_personnelle_priorite']
    },
    travelDesire: {
      type: String,
      enum: ['passionne', 'occasionnel', 'homebody']
    }
  },
  
  // Dealbreakers (éliminatoires)
  dealbreakers: {
    smoking: {
      type: Boolean,
      default: false
    },
    pets: {
      type: Boolean,
      default: false
    },
    differentReligion: {
      type: Boolean,
      default: false
    },
    longDistance: {
      type: Boolean,
      default: false
    },
    childrenFromPrevious: {
      type: Boolean,
      default: false
    }
  },
  
  // Questions ouvertes (pour Premium/VIP)
  openQuestions: [{
    question: String,
    answer: String
  }],
  
  // Statut du test
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  
  // Dates
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculer le score de compatibilité entre deux utilisateurs
compatibilityTestSchema.statics.calculateCompatibility = function(test1, test2) {
  let score = 0;
  let maxScore = 0;
  
  // Compatibilité de personnalité (30 points)
  if (test1.personality && test2.personality) {
    const personalityKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    personalityKeys.forEach(key => {
      if (test1.personality[key] && test2.personality[key]) {
        const diff = Math.abs(test1.personality[key] - test2.personality[key]);
        score += (10 - diff) * 0.6; // Plus les scores sont proches, mieux c'est
        maxScore += 6;
      }
    });
  }
  
  // Compatibilité des valeurs (40 points)
  if (test1.values && test2.values) {
    const valuesKeys = ['family', 'career', 'adventure', 'stability', 'spirituality', 'creativity'];
    valuesKeys.forEach(key => {
      if (test1.values[key] && test2.values[key]) {
        const diff = Math.abs(test1.values[key] - test2.values[key]);
        score += (10 - diff) * 0.67;
        maxScore += 6.7;
      }
    });
  }
  
  // Compatibilité des objectifs de vie (30 points)
  if (test1.lifeGoals && test2.lifeGoals) {
    // Enfants - très important
    if (test1.lifeGoals.wantsChildren && test2.lifeGoals.wantsChildren) {
      if (test1.lifeGoals.wantsChildren === test2.lifeGoals.wantsChildren) {
        score += 10;
      } else if (test1.lifeGoals.wantsChildren === 'peut_etre' || test2.lifeGoals.wantsChildren === 'peut_etre') {
        score += 5;
      }
      maxScore += 10;
    }
    
    // Mariage
    if (test1.lifeGoals.wantsMarriage && test2.lifeGoals.wantsMarriage) {
      if (test1.lifeGoals.wantsMarriage === test2.lifeGoals.wantsMarriage) {
        score += 7;
      } else if (test1.lifeGoals.wantsMarriage === 'peut_etre' || test2.lifeGoals.wantsMarriage === 'peut_etre') {
        score += 3;
      }
      maxScore += 7;
    }
    
    // Ambition carrière et voyage
    const goalMatches = ['careerAmbition', 'travelDesire'];
    goalMatches.forEach(key => {
      if (test1.lifeGoals[key] && test2.lifeGoals[key]) {
        if (test1.lifeGoals[key] === test2.lifeGoals[key]) {
          score += 6.5;
        } else if (test1.lifeGoals[key] === 'equilibre' || test2.lifeGoals[key] === 'equilibre') {
          score += 3;
        }
        maxScore += 6.5;
      }
    });
  }
  
  // Vérifier les dealbreakers
  let hasDealbreaker = false;
  if (test1.dealbreakers && test2.dealbreakers) {
    const dealbreakerKeys = ['smoking', 'pets', 'differentReligion', 'longDistance', 'childrenFromPrevious'];
    dealbreakerKeys.forEach(key => {
      // Si l'un considère ça comme dealbreaker et l'autre a cette caractéristique
      if (test1.dealbreakers[key] || test2.dealbreakers[key]) {
        hasDealbreaker = true;
      }
    });
  }
  
  // Si dealbreaker, réduire fortement le score
  if (hasDealbreaker) {
    score *= 0.3;
  }
  
  // Normaliser le score sur 100
  const normalizedScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  
  return {
    score: Math.max(0, Math.min(100, normalizedScore)),
    hasDealbreaker
  };
};

const CompatibilityTest = mongoose.model('CompatibilityTest', compatibilityTestSchema);

export default CompatibilityTest;