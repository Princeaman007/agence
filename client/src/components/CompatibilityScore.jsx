import { motion } from 'framer-motion';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';

const CompatibilityScore = ({ score, hasDealbreaker = false, size = 'large', showDetails = true }) => {
  
  // Déterminer la couleur et le message selon le score
  const getScoreColor = () => {
    if (hasDealbreaker) return 'text-red-500';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getScoreGradient = () => {
    if (hasDealbreaker) return 'from-red-500 to-red-600';
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-blue-400 to-blue-600';
    if (score >= 40) return 'from-yellow-400 to-yellow-600';
    return 'from-gray-400 to-gray-600';
  };

  const getScoreMessage = () => {
    if (hasDealbreaker) return 'Incompatibilité majeure';
    if (score >= 90) return 'Match exceptionnel !';
    if (score >= 80) return 'Excellente compatibilité';
    if (score >= 70) return 'Très bonne compatibilité';
    if (score >= 60) return 'Bonne compatibilité';
    if (score >= 50) return 'Compatibilité moyenne';
    if (score >= 40) return 'Compatibilité modérée';
    return 'Compatibilité faible';
  };

  const getScoreIcon = () => {
    if (hasDealbreaker) return <AlertCircle className="w-6 h-6" />;
    if (score >= 80) return <Sparkles className="w-6 h-6" />;
    return <Heart className="w-6 h-6" />;
  };

  // Taille selon prop
  const sizeClasses = {
    small: 'w-16 h-16 text-2xl',
    medium: 'w-24 h-24 text-3xl',
    large: 'w-32 h-32 text-4xl'
  };

  return (
    <div className="flex flex-col items-center">
      {/* Cercle de score avec animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="relative"
      >
        {/* Cercle de progression SVG */}
        <svg className={sizeClasses[size]} viewBox="0 0 100 100">
          {/* Cercle de fond */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Cercle de progression */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={hasDealbreaker ? '#ef4444' : score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#9ca3af'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - score / 100)}`}
            transform="rotate(-90 50 50)"
            initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - score / 100) }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>

        {/* Score au centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`font-bold ${getScoreColor()}`}
              style={{ fontSize: size === 'large' ? '2rem' : size === 'medium' ? '1.5rem' : '1.25rem' }}
            >
              {score}%
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Message et détails */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <div className={`flex items-center justify-center gap-2 ${getScoreColor()} mb-2`}>
            {getScoreIcon()}
            <span className="font-semibold text-lg">{getScoreMessage()}</span>
          </div>
          
          {hasDealbreaker && (
            <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ⚠️ Certains critères essentiels ne correspondent pas
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Badge visuel selon le score */}
      {showDetails && !hasDealbreaker && score >= 80 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className={`mt-4 px-6 py-2 bg-gradient-to-r ${getScoreGradient()} text-white rounded-full font-semibold shadow-lg`}
        >
          💕 Super Match !
        </motion.div>
      )}
    </div>
  );
};

export default CompatibilityScore;