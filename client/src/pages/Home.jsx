import { Link } from 'react-router-dom';
import { FaHeart, FaShieldAlt, FaUsers, FaChartLine, FaStar, FaCrown, FaCheck, FaArrowRight, FaQuoteLeft } from 'react-icons/fa';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';

const Home = () => {
  const features = [
    {
      icon: FaHeart,
      title: 'Matchs Intelligents',
      description: 'Notre algorithme de compatibilité trouve les personnes qui vous correspondent vraiment.',
      color: 'pink'
    },
    {
      icon: FaShieldAlt,
      title: 'Sécurité Garantie',
      description: 'Vérification des profils et modération active pour votre sécurité.',
      color: 'blue'
    },
    {
      icon: FaUsers,
      title: 'Coach Personnel',
      description: 'Bénéficiez des conseils d\'un expert pour réussir vos rencontres.',
      color: 'purple'
    },
    {
      icon: FaChartLine,
      title: 'Tests de Compatibilité',
      description: 'Tests scientifiques pour mesurer votre compatibilité avec vos matchs.',
      color: 'green'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Membres Actifs' },
    { number: '5,000+', label: 'Couples Formés' },
    { number: '95%', label: 'Satisfaction' },
    { number: '24/7', label: 'Support Client' }
  ];

  const plans = [
    {
      name: 'Gratuit',
      price: '0',
      period: 'Toujours',
      features: [
        '5 messages par jour',
        '10 profils par jour',
        'Likes illimités',
        'Test de base'
      ],
      cta: 'Commencer',
      link: '/register',
      popular: false
    },
    {
      name: 'Premium',
      price: '19.99',
      period: 'par mois',
      features: [
        'Messages illimités',
        'Profils illimités',
        'Recherche avancée',
        'Test complet',
        '1 session coach/mois',
        'Badge vérifié'
      ],
      cta: 'Essayer Gratuitement',
      link: '/register',
      popular: true
    },
    {
      name: 'VIP',
      price: '49.99',
      period: 'par mois',
      features: [
        'Tout du Premium',
        'Coach dédié',
        'Sessions illimitées',
        'Matchs curatés',
        'Événements exclusifs',
        'Support prioritaire'
      ],
      cta: 'Devenir VIP',
      link: '/register',
      popular: false
    }
  ];

  const testimonials = [
    {
      name: 'Marie & Thomas',
      image: '',
      role: 'Couple depuis 8 mois',
      quote: 'Nous nous sommes rencontrés sur Dating Platform et c\'est la meilleure chose qui nous soit arrivée ! Les matchs étaient vraiment pertinents.',
      rating: 5
    },
    {
      name: 'Sophie',
      image: '',
      role: 'Utilisatrice VIP',
      quote: 'Le coaching personnalisé m\'a vraiment aidée à améliorer mon profil et ma confiance. Je recommande à 100% !',
      rating: 5
    },
    {
      name: 'Lucas',
      image: '',
      role: 'Utilisateur Premium',
      quote: 'Interface moderne, fonctionnalités utiles et vraiment efficace. J\'ai trouvé quelqu\'un de spécial en moins de 2 mois.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Trouvez l'amour
                <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                  {' '}véritable
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Rencontrez des personnes compatibles avec notre algorithme intelligent. 
                Plus de 5,000 couples formés et heureux.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/Register"
                  className="btn-primary text-center text-lg px-8 py-4"
                >
                  Commencer Gratuitement
                  <FaArrowRight className="inline ml-2" />
                </Link>
                <a
                  href="#features"
                  className="btn-secondary text-center text-lg px-8 py-4"
                >
                  En savoir plus
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <FaCheck className="text-green-500" />
                  <span>Gratuit pour commencer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheck className="text-green-500" />
                  <span>Sans engagement</span>
                </div>
              </div>
            </div>

            {/* Right Image/Illustration */}
            <div className="relative">
              <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8">
                <img
                  src="https://images.unsplash.com/photo-1522621032211-ac0031dfbddc?w=600&h=400&fit=crop"
                  alt="Couple heureux"
                  className="rounded-xl w-full h-auto"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Db3VwbGUgSGV1cmV1eDwvdGV4dD48L3N2Zz4=';
                  }}
                />
                
                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-green-100 p-2 rounded-full">
                      <FaHeart className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">+127</p>
                      <p className="text-xs text-gray-600">Nouveaux matchs</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <FaStar className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">4.9/5</p>
                      <p className="text-xs text-gray-600">Satisfaction</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute top-4 right-4 w-72 h-72 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-full blur-3xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir Dating Platform ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des fonctionnalités innovantes pour vous aider à trouver l'amour véritable
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card hover:scale-105 transition-transform">
                  <div className={`bg-${feature.color}-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4`}>
                    <Icon className={`text-3xl text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choisissez votre plan
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Commencez gratuitement, passez à Premium quand vous êtes prêt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`card relative ${
                  plan.popular ? 'ring-4 ring-primary-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      POPULAIRE
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}€
                    </span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <FaCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.link}
                  className={`block text-center py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ils ont trouvé l'amour
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Des milliers de couples heureux nous font confiance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                <FaQuoteLeft className="text-3xl text-primary-500 mb-4" />
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.split(' ')[0][0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-secondary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à trouver l'amour ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des milliers de personnes qui ont déjà trouvé leur moitié
          </p>
          <Link
            to="/Register"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            Commencer Gratuitement
            <FaArrowRight className="inline ml-2" />
          </Link>
          <p className="text-white/80 mt-4 text-sm">
            Gratuit pour toujours • Sans carte bancaire • Annulez à tout moment
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;