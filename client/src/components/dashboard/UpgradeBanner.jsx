import { Link } from 'react-router-dom';
import { FaCrown, FaCheck, FaTimes } from 'react-icons/fa';

const UpgradeBanner = ({ type = 'full', limitation = '' }) => {
  if (type === 'compact') {
    return (
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-lg p-4 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-white">
            <FaCrown size={24} />
            <div>
              <p className="font-bold">Passez à Premium</p>
              <p className="text-sm opacity-90">{limitation}</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:shadow-xl transition-all duration-200"
          >
            Découvrir
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary-500 via-secondary-500 to-pink-500 rounded-2xl p-8 mb-8 shadow-2xl text-white relative overflow-hidden">
      {/* Décorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              <FaCrown size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Passez à Premium</h2>
              <p className="text-white/90">Débloquez toutes les fonctionnalités</p>
            </div>
          </div>
          <Link
            to="/pricing"
            className="bg-white text-primary-600 px-8 py-3 rounded-xl font-bold hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
          >
            Voir les offres
          </Link>
        </div>

        {/* Comparaison Gratuit vs Premium */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {/* Compte Gratuit */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Compte Gratuit</h3>
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Actuel</span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-300 flex-shrink-0" />
                <span className="text-sm">5 messages par jour</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-300 flex-shrink-0" />
                <span className="text-sm">10 profils visibles par jour</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-300 flex-shrink-0" />
                <span className="text-sm">Test de compatibilité basique</span>
              </li>
              <li className="flex items-start">
                <FaTimes className="mr-2 mt-1 text-red-300 flex-shrink-0" />
                <span className="text-sm opacity-75">Recherche avancée</span>
              </li>
              <li className="flex items-start">
                <FaTimes className="mr-2 mt-1 text-red-300 flex-shrink-0" />
                <span className="text-sm opacity-75">Statistiques détaillées</span>
              </li>
              <li className="flex items-start">
                <FaTimes className="mr-2 mt-1 text-red-300 flex-shrink-0" />
                <span className="text-sm opacity-75">Session avec un coach</span>
              </li>
              <li className="flex items-start">
                <FaTimes className="mr-2 mt-1 text-red-300 flex-shrink-0" />
                <span className="text-sm opacity-75">Contact utilisateurs Premium</span>
              </li>
            </ul>
          </div>

          {/* Compte Premium */}
          <div className="bg-white text-gray-800 rounded-xl p-6 shadow-xl transform scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Compte Premium
              </h3>
              <span className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold">
                Populaire
              </span>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold">Messages illimités</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold">Profils illimités</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold">Test de compatibilité complet</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold">Recherche avancée avec filtres</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold">Statistiques complètes</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold">1 session coach par mois</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold">Contact tous les utilisateurs</span>
              </li>
              <li className="flex items-start">
                <FaCheck className="mr-2 mt-1 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold">Badge vérifié</span>
              </li>
            </ul>
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold text-primary-600">19,99€ <span className="text-sm text-gray-600">/mois</span></p>
            </div>
          </div>
        </div>

        {/* CTA supplémentaire */}
        <div className="mt-8 text-center">
          <p className="text-white/90 mb-4">
            ✨ Offre spéciale : Première semaine gratuite !
          </p>
          <Link
            to="/pricing"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1"
          >
            Essayer Premium Gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpgradeBanner;