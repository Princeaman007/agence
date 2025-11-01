import { motion } from 'framer-motion';

const QuestionCard = ({ 
  question, 
  description, 
  type, 
  options, 
  value, 
  onChange,
  min = 1,
  max = 10 
}) => {
  
  // Rendu pour slider (échelles 1-10)
  const renderSlider = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Pas du tout</span>
        <span className="text-2xl font-bold text-primary-600">{value || min}</span>
        <span>Énormément</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value || min}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #667eea 0%, #667eea ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
        }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((num) => (
          <span key={num}>{num}</span>
        ))}
      </div>
    </div>
  );

  // Rendu pour choix multiples (cards cliquables)
  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {options.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-6 rounded-xl border-2 transition-all ${
            value === option.value
              ? 'border-primary-500 bg-primary-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
          }`}
        >
          <div className="text-4xl mb-3">{option.icon}</div>
          <h4 className="font-semibold text-gray-900 mb-2">{option.label}</h4>
          <p className="text-sm text-gray-600">{option.description}</p>
        </motion.button>
      ))}
    </div>
  );

  // Rendu pour checkbox (dealbreakers)
  const renderCheckbox = () => (
    <div className="flex items-center">
      <input
        type="checkbox"
        checked={value || false}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
      />
      <label className="ml-3 text-gray-700">
        {question}
      </label>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-lg p-8 mb-6"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{question}</h3>
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}
      
      <div className="mt-6">
        {type === 'slider' && renderSlider()}
        {type === 'cards' && renderCards()}
        {type === 'checkbox' && renderCheckbox()}
      </div>
    </motion.div>
  );
};

export default QuestionCard;