import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaCrown, FaStar, FaHeart, FaTimes } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuthStore } from '../store/useStore';

const Pricing = () => {
  const { user } = useAuthStore();
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // monthly or yearly

  const plans = [
    {
      name: 'Gratuit',
      price: 0,
      yearlyPrice: 0,
      icon: FaHeart,
      color: 'gray',
      current: user?.accountType === 'gratuit',
      features: [
        { text: '5 messages par jour', included: true },
        { text: '10 profils par jour', included: true },
        { text: 'Signaux d\'intérêt illimités', included: true },
        { text: 'Test de compatibilité basique', included: true },
        { text: 'Recherche avancée', included: false },
        { text: 'Messages illimités', included: false },
        { text: 'Statistiques détaillées', included: false },
        { text: 'Session coach', included: false },
      ]
    },
    {
      name: 'Premium',
      price: 19.99,
      yearlyPrice: 15.99,
      icon: FaStar,
      color: 'primary',
      popular: true,
      current: user?.accountType === 'premium',
      features: [
        { text: 'Messages illimités', included: true },
        { text: 'Profils illimités', included: true },
        { text: 'Recherche avancée avec filtres', included: true },
        { text: 'Test de compatibilité complet', included: true },
        { text: 'Statistiques avancées', included: true },
        { text: 'Badge vérifié', included: true },
        { text: '1 session coach par mois (30 min)', included: true },
        { text: 'Contact tous les utilisateurs', included: true },
      ]
    },
    {
      name: 'VIP',
      price: 49.99,
      yearlyPrice: 39.99,
      icon: FaCrown,
      color: 'secondary',
      current: user?.accountType === 'vip',
      features: [
        { text: 'Tout du Premium', included: true },
        { text: 'Coach dédié personnel', included: true },
        { text: 'Sessions coach illimitées', included: true },
        { text: 'Matchs curatés manuellement', included: true },
        { text: 'Suivi personnalisé de relation', included: true },
        { text: 'Organisation de rendez-vous', included: true },
        { text: 'Événements exclusifs VIP', included: true },
        { text: 'Support prioritaire 24/7', included: true },
      ]
    }
  ];

  const getPrice = (plan) => {
    const price = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.price;
    return price;
  };

  const getSavings = (plan) => {
    if (plan.price === 0) return null;
    const monthlyCost = plan.price * 12;
    const yearlyCost = plan.yearlyPrice * 12;
    const savings = monthlyCost - yearlyCost;
    return savings.toFixed(2);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choisissez le plan qui vous convient
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Trouvez l'amour avec l'accompagnement qu'il vous faut
        </p>

        {/* Toggle Mensuel/Annuel */}
        <div className="inline-flex items-center bg-gray-200 rounded-full p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-gray-600'
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-full font-semibold transition-all relative ${
              billingPeriod === 'yearly'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-gray-600'
            }`}
          >
            Annuel
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const price = getPrice(plan);
          const savings = getSavings(plan);

          return (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                plan.popular ? 'ring-4 ring-primary-500 transform scale-105' : ''
              }`}
            >
              {/* Badge Populaire */}
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  POPULAIRE
                </div>
              )}

              {/* Badge Plan Actuel */}
              {plan.current && (
                <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-sm font-bold rounded-br-lg">
                  PLAN ACTUEL
                </div>
              )}

              <div className="p-8">
                {/* Icon et Nom */}
                <div className="flex items-center justify-center mb-6">
                  <div className={`bg-${plan.color}-100 p-4 rounded-full`}>
                    <Icon className={`text-4xl text-${plan.color}-600`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  {plan.name}
                </h3>

                {/* Prix */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      {price === 0 ? 'Gratuit' : `${price}€`}
                    </span>
                    {price > 0 && (
                      <span className="text-gray-600 ml-2">/mois</span>
                    )}
                  </div>
                  {billingPeriod === 'yearly' && savings && (
                    <p className="text-sm text-green-600 mt-2">
                      Économisez {savings}€ par an
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      {feature.included ? (
                        <FaCheck className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                      ) : (
                        <FaTimes className="text-gray-300 mr-3 mt-1 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                {plan.current ? (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-bold cursor-not-allowed"
                  >
                    Plan Actuel
                  </button>
                ) : price === 0 ? (
                  <Link
                    to="/dashboard"
                    className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold text-center hover:bg-gray-300 transition"
                  >
                    Continuer avec Gratuit
                  </Link>
                ) : (
                  <button
                    className={`w-full bg-gradient-to-r from-${plan.color}-500 to-${plan.color === 'primary' ? 'secondary' : 'pink'}-500 text-white py-3 rounded-lg font-bold hover:shadow-xl transition-all`}
                  >
                    Commencer Maintenant
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Questions Fréquentes
        </h2>
        <div className="space-y-4">
          <details className="bg-white rounded-lg shadow-md p-6 group">
            <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
              Puis-je annuler mon abonnement à tout moment ?
              <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-4">
              Oui, vous pouvez annuler votre abonnement à tout moment depuis votre profil. Votre accès Premium restera actif jusqu'à la fin de votre période de facturation.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-6 group">
            <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
              Comment fonctionne le coach pour les comptes Premium ?
              <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-4">
              Les utilisateurs Premium bénéficient d'une session de 30 minutes par mois avec un coach relationnel professionnel. Le coach vous aide à optimiser votre profil, vous donne des conseils et répond à vos questions.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-6 group">
            <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
              Quelle est la différence entre Premium et VIP ?
              <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-4">
              Le plan VIP offre un coach dédié avec sessions illimitées, des matchs curatés manuellement par votre coach, un suivi personnalisé de vos relations, et l'accès à des événements exclusifs. C'est le plan le plus complet pour ceux qui recherchent un accompagnement sur-mesure.
            </p>
          </details>

          <details className="bg-white rounded-lg shadow-md p-6 group">
            <summary className="font-semibold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
              Y a-t-il une période d'essai ?
              <span className="text-primary-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-600 mt-4">
              Oui ! Nous offrons 7 jours d'essai gratuit sur les plans Premium et VIP. Vous pouvez annuler à tout moment pendant cette période sans frais.
            </p>
          </details>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Ce qu'ils en pensent
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                M
              </div>
              <div className="ml-3">
                <p className="font-semibold">Marie & Thomas</p>
                <p className="text-sm text-gray-600">Premium</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "Grâce au plan Premium et aux conseils du coach, nous avons trouvé notre âme sœur en 2 mois ! Les filtres avancés ont vraiment fait la différence."
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                S
              </div>
              <div className="ml-3">
                <p className="font-semibold">Sophie</p>
                <p className="text-sm text-gray-600">VIP</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "Le plan VIP est extraordinaire ! Mon coach m'a présenté des personnes vraiment compatibles. Je suis maintenant en couple depuis 6 mois !"
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <div className="ml-3">
                <p className="font-semibold">Lucas</p>
                <p className="text-sm text-gray-600">Premium</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "Les messages illimités m'ont permis de vraiment apprendre à connaître les personnes. Meilleur investissement que j'ai fait !"
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          Des questions ? Contactez-nous à{' '}
          <a href="mailto:support@dating-platform.com" className="text-primary-600 font-semibold hover:underline">
            support@dating-platform.com
          </a>
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Pricing;