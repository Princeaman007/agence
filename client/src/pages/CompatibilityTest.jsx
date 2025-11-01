import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Loader } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import QuestionCard from '../components/QuestionCard';
import { compatibilityService } from '../services/userService';
import { useAuthStore } from '../store/useStore';
import toast from 'react-hot-toast';

const CompatibilityTest = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    personality: {
      openness: 5,
      conscientiousness: 5,
      extraversion: 5,
      agreeableness: 5,
      neuroticism: 5
    },
    values: {
      family: 5,
      career: 5,
      adventure: 5,
      stability: 5,
      spirituality: 5,
      creativity: 5
    },
    lifestyle: {
      social: '',
      activity: '',
      routine: '',
      spending: ''
    },
    lifeGoals: {
      wantsChildren: '',
      wantsMarriage: '',
      careerAmbition: '',
      travelDesire: ''
    },
    dealbreakers: {
      smoking: false,
      pets: false,
      differentReligion: false,
      longDistance: false,
      childrenFromPrevious: false
    }
  });

  // Charger le test existant au montage
  useEffect(() => {
    loadExistingTest();
  }, []);

  const loadExistingTest = async () => {
    try {
      setLoading(true);
      const response = await compatibilityService.getMyTest();
      if (response.success && response.data) {
        setFormData(response.data);
        toast.success('Test précédent chargé');
      }
    } catch (error) {
      // Pas de test existant, c'est normal
      console.log('Aucun test existant');
    } finally {
      setLoading(false);
    }
  };

  // Configuration des étapes
  const steps = [
    {
      title: 'Personnalité',
      subtitle: 'Les 5 grands traits de personnalité',
      icon: '🧠',
      questions: [
        {
          key: 'personality.openness',
          question: 'Ouverture d\'esprit',
          description: 'À quel point êtes-vous ouvert aux nouvelles expériences, idées et changements ?',
          type: 'slider'
        },
        {
          key: 'personality.conscientiousness',
          question: 'Conscience professionnelle',
          description: 'À quel point êtes-vous organisé, responsable et discipliné ?',
          type: 'slider'
        },
        {
          key: 'personality.extraversion',
          question: 'Extraversion',
          description: 'À quel point êtes-vous sociable, énergique et à l\'aise en groupe ?',
          type: 'slider'
        },
        {
          key: 'personality.agreeableness',
          question: 'Amabilité',
          description: 'À quel point êtes-vous coopératif, empathique et bienveillant ?',
          type: 'slider'
        },
        {
          key: 'personality.neuroticism',
          question: 'Stabilité émotionnelle',
          description: 'À quel point gérez-vous bien le stress et restez-vous calme ? (1 = très stable, 10 = très anxieux)',
          type: 'slider'
        }
      ]
    },
    {
      title: 'Valeurs',
      subtitle: 'Ce qui compte le plus pour vous',
      icon: '💎',
      questions: [
        {
          key: 'values.family',
          question: 'Famille',
          description: 'Importance de la famille dans votre vie',
          type: 'slider'
        },
        {
          key: 'values.career',
          question: 'Carrière',
          description: 'Importance de votre réussite professionnelle',
          type: 'slider'
        },
        {
          key: 'values.adventure',
          question: 'Aventure',
          description: 'Importance de l\'aventure et de la nouveauté',
          type: 'slider'
        },
        {
          key: 'values.stability',
          question: 'Stabilité',
          description: 'Importance de la sécurité et de la routine',
          type: 'slider'
        },
        {
          key: 'values.spirituality',
          question: 'Spiritualité',
          description: 'Importance de la spiritualité ou de la religion',
          type: 'slider'
        },
        {
          key: 'values.creativity',
          question: 'Créativité',
          description: 'Importance de l\'expression créative et artistique',
          type: 'slider'
        }
      ]
    },
    {
      title: 'Style de vie',
      subtitle: 'Votre quotidien',
      icon: '🏡',
      questions: [
        {
          key: 'lifestyle.social',
          question: 'Vie sociale',
          description: 'Comment décririez-vous votre vie sociale ?',
          type: 'cards',
          options: [
            { value: 'introvert', label: 'Introverti', description: 'Je préfère les petits groupes et ai besoin de temps seul', icon: '📚' },
            { value: 'ambivert', label: 'Ambivert', description: 'Je m\'adapte selon les situations', icon: '⚖️' },
            { value: 'extrovert', label: 'Extraverti', description: 'J\'adore être entouré et rencontrer du monde', icon: '🎉' }
          ]
        },
        {
          key: 'lifestyle.activity',
          question: 'Activité physique',
          description: 'Quel est votre niveau d\'activité physique ?',
          type: 'cards',
          options: [
            { value: 'sedentaire', label: 'Sédentaire', description: 'Je préfère les activités calmes', icon: '🛋️' },
            { value: 'modere', label: 'Modéré', description: 'Je fais du sport occasionnellement', icon: '🚶' },
            { value: 'tres_actif', label: 'Très actif', description: 'Le sport fait partie de ma routine', icon: '🏃' }
          ]
        },
        {
          key: 'lifestyle.routine',
          question: 'Organisation',
          description: 'Comment gérez-vous votre quotidien ?',
          type: 'cards',
          options: [
            { value: 'flexible', label: 'Flexible', description: 'J\'aime la spontanéité', icon: '🎲' },
            { value: 'structure', label: 'Structuré', description: 'J\'ai mes habitudes', icon: '📅' },
            { value: 'tres_structure', label: 'Très structuré', description: 'Je planifie tout', icon: '📊' }
          ]
        },
        {
          key: 'lifestyle.spending',
          question: 'Dépenses',
          description: 'Comment gérez-vous vos finances ?',
          type: 'cards',
          options: [
            { value: 'econome', label: 'Économe', description: 'J\'épargne et fais attention', icon: '🐷' },
            { value: 'equilibre', label: 'Équilibré', description: 'Je trouve un juste milieu', icon: '⚖️' },
            { value: 'genereux', label: 'Généreux', description: 'J\'aime profiter et partager', icon: '💸' }
          ]
        }
      ]
    },
    {
      title: 'Objectifs de vie',
      subtitle: 'Votre vision du futur',
      icon: '🎯',
      questions: [
        {
          key: 'lifeGoals.wantsChildren',
          question: 'Enfants',
          description: 'Voulez-vous avoir des enfants ?',
          type: 'cards',
          options: [
            { value: 'oui', label: 'Oui', description: 'Je veux fonder une famille', icon: '👶' },
            { value: 'non', label: 'Non', description: 'Je ne veux pas d\'enfants', icon: '🚫' },
            { value: 'peut_etre', label: 'Peut-être', description: 'Je suis ouvert à la discussion', icon: '🤔' },
            { value: 'deja_parent', label: 'Déjà parent', description: 'J\'ai déjà des enfants', icon: '👨‍👩‍👧' }
          ]
        },
        {
          key: 'lifeGoals.wantsMarriage',
          question: 'Mariage',
          description: 'Le mariage est-il important pour vous ?',
          type: 'cards',
          options: [
            { value: 'oui', label: 'Oui', description: 'Le mariage est important', icon: '💍' },
            { value: 'non', label: 'Non', description: 'Je ne crois pas au mariage', icon: '🤝' },
            { value: 'peut_etre', label: 'Peut-être', description: 'Pas prioritaire mais possible', icon: '💭' }
          ]
        },
        {
          key: 'lifeGoals.careerAmbition',
          question: 'Ambition professionnelle',
          description: 'Quelle place occupe la carrière dans votre vie ?',
          type: 'cards',
          options: [
            { value: 'tres_ambitieux', label: 'Très ambitieux', description: 'Ma carrière est prioritaire', icon: '🚀' },
            { value: 'equilibre', label: 'Équilibre', description: 'Je cherche l\'équilibre vie pro/perso', icon: '⚖️' },
            { value: 'vie_personnelle_priorite', label: 'Vie personnelle', description: 'Ma vie perso passe avant', icon: '🏡' }
          ]
        },
        {
          key: 'lifeGoals.travelDesire',
          question: 'Voyages',
          description: 'Quelle importance accordez-vous aux voyages ?',
          type: 'cards',
          options: [
            { value: 'passionne', label: 'Passionné', description: 'Je vis pour voyager', icon: '✈️' },
            { value: 'occasionnel', label: 'Occasionnel', description: 'J\'aime voyager de temps en temps', icon: '🗺️' },
            { value: 'homebody', label: 'Casanier', description: 'Je préfère rester chez moi', icon: '🏠' }
          ]
        }
      ]
    },
    {
      title: 'Dealbreakers',
      subtitle: 'Les critères éliminatoires pour vous',
      icon: '⚠️',
      questions: [
        {
          key: 'dealbreakers.smoking',
          question: 'Le tabagisme est un critère éliminatoire pour moi',
          type: 'checkbox'
        },
        {
          key: 'dealbreakers.pets',
          question: 'Ne pas aimer les animaux est un critère éliminatoire',
          type: 'checkbox'
        },
        {
          key: 'dealbreakers.differentReligion',
          question: 'Une religion différente est un critère éliminatoire',
          type: 'checkbox'
        },
        {
          key: 'dealbreakers.longDistance',
          question: 'Une relation à distance est impossible pour moi',
          type: 'checkbox'
        },
        {
          key: 'dealbreakers.childrenFromPrevious',
          question: 'Un partenaire avec enfants d\'une relation précédente est éliminatoire',
          type: 'checkbox'
        }
      ]
    }
  ];

  // Gérer le changement de valeur
  const handleChange = (key, value) => {
    const keys = key.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      if (keys.length === 2) {
        newData[keys[0]] = {
          ...newData[keys[0]],
          [keys[1]]: value
        };
      }
      return newData;
    });
  };

  // Obtenir la valeur d'un champ
  const getValue = (key) => {
    const keys = key.split('.');
    if (keys.length === 2) {
      return formData[keys[0]]?.[keys[1]];
    }
    return null;
  };

  // Vérifier si l'étape actuelle est complète
  const isStepComplete = () => {
    const step = steps[currentStep];
    return step.questions.every(q => {
      const value = getValue(q.key);
      if (q.type === 'slider') return value !== null && value !== undefined;
      if (q.type === 'cards') return value !== '';
      if (q.type === 'checkbox') return true; // Les checkboxes sont optionnelles
      return true;
    });
  };

  // Navigation
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Soumettre le test
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const response = await compatibilityService.submitTest(formData);
      
      if (response.success) {
        toast.success('Test enregistré avec succès ! 🎉');
        navigate('/compatibility-results');
      }
    } catch (error) {
      console.error('Erreur soumission test:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Test de Compatibilité
          </h1>
          <p className="text-gray-600 text-lg">
            Découvrez vos meilleurs matchs en répondant à ces questions
          </p>
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Étape {currentStep + 1} sur {steps.length}
            </span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          {/* Indicateurs d'étapes */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index === currentStep ? 'scale-110' : index < currentStep ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-all ${
                    index < currentStep
                      ? 'bg-green-100 border-2 border-green-500'
                      : index === currentStep
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}
                >
                  {index < currentStep ? <Check className="w-6 h-6 text-green-600" /> : step.icon}
                </div>
                <span className="text-xs text-center font-medium hidden md:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Titre de l'étape */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {currentStepData.icon} {currentStepData.title}
          </h2>
          <p className="text-gray-600">{currentStepData.subtitle}</p>
        </motion.div>

        {/* Questions */}
        <AnimatePresence mode="wait">
          <div key={currentStep}>
            {currentStepData.questions.map((question, index) => (
              <QuestionCard
                key={question.key}
                question={question.question}
                description={question.description}
                type={question.type}
                options={question.options}
                value={getValue(question.key)}
                onChange={(value) => handleChange(question.key, value)}
              />
            ))}
          </div>
        </AnimatePresence>

        {/* Boutons de navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border-2 border-primary-500 text-primary-600 hover:bg-primary-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isStepComplete() || submitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all ${
                !isStepComplete() || submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg'
              }`}
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  Terminer
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goToNextStep}
              disabled={!isStepComplete()}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                !isStepComplete()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg'
              }`}
            >
              Suivant
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Indication si étape incomplète */}
        {!isStepComplete() && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-gray-500 mt-4"
          >
            ⚠️ Veuillez répondre à toutes les questions pour continuer
          </motion.p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompatibilityTest;