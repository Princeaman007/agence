import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaHome, FaEnvelope, FaUser, FaSearch, FaChartBar, FaCrown, FaBars, FaTimes, FaSignOutAlt, FaBrain, FaFire } from 'react-icons/fa';
import { useAuthStore } from '../../store/useStore';
import { authService } from '../../services/userService';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Construire l'URL complète pour les images
  const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
  const profilePhotoUrl = user?.profilePhoto 
    ? `${BASE_URL}${user.profilePhoto}` 
    : null;

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  // ✅ NOUVEAU : Menu items avec Phase 4 (Compatibilité)
  const menuItems = [
    { 
      name: 'Accueil', 
      path: '/dashboard', 
      icon: FaHome, 
      forAll: true 
    },
    { 
      name: 'Test de Compatibilité', 
      path: '/compatibility-test', 
      icon: FaBrain, 
      forAll: true,
      badge: 'Nouveau',
      description: 'Découvre tes meilleurs matchs'
    },
    { 
      name: 'Mes Matchs', 
      path: '/matches', 
      icon: FaFire, 
      forAll: true,
      badge: 'Phase 4',
      description: 'Profils compatibles avec toi'
    },
    { 
      name: 'Messages', 
      path: '/dashboard/messages', 
      icon: FaEnvelope, 
      forAll: true 
    },
    { 
      name: 'Recherche', 
      path: '/search', 
      icon: FaSearch, 
      premium: true 
    },
    { 
      name: 'Mon Profil', 
      path: `/profile/${user?._id}`, 
      icon: FaUser, 
      forAll: true 
    },
    { 
      name: 'Statistiques', 
      path: '/dashboard/stats', 
      icon: FaChartBar, 
      premium: true 
    },
  ];

  const isActive = (path) => {
    // Pour les matchs, considérer aussi /compatibility-results comme actif
    if (path === '/matches' && (location.pathname === '/compatibility-results' || location.pathname === '/matches')) {
      return true;
    }
    return location.pathname === path;
  };

  const canAccess = (item) => {
    if (item.forAll) return true;
    if (item.premium && (user?.accountType === 'premium' || user?.accountType === 'vip')) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Logo et menu burger */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-primary-600"
            >
              {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <FaHeart className="text-3xl text-primary-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                Dating Platform
              </span>
            </Link>
          </div>

          {/* User info et actions */}
          <div className="flex items-center space-x-4">
            {/* Badge du type de compte */}
            <div>
              {user?.accountType === 'premium' && (
                <span className="badge-premium">PREMIUM</span>
              )}
              {user?.accountType === 'vip' && (
                <span className="badge-vip">VIP</span>
              )}
              {user?.accountType === 'gratuit' && (
                <Link to="/pricing" className="text-sm px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold hover:bg-yellow-200 transition">
                  Gratuit - Passer à Premium
                </Link>
              )}
            </div>

            {/* Email verification warning */}
            {!user?.isEmailVerified && (
              <Link to="/verify-email-notice" className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded-full font-semibold hover:bg-red-200 transition">
                ⚠️ Vérifier l'email
              </Link>
            )}

            {/* Avatar et menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 hover:opacity-80 transition">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={user.firstName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold"
                  style={{ display: profilePhotoUrl ? 'none' : 'flex' }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="hidden md:block font-medium text-gray-700">
                  {user?.firstName}
                </span>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Link
                  to={`/profile/${user?._id}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                >
                  <FaUser className="inline mr-2" />
                  Mon Profil
                </Link>
                {user?.accountType === 'gratuit' && (
                  <Link
                    to="/pricing"
                    className="block px-4 py-2 text-primary-600 hover:bg-gray-100 transition font-semibold"
                  >
                    <FaCrown className="inline mr-2" />
                    Passer Premium
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition"
                >
                  <FaSignOutAlt className="inline mr-2" />
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            mt-16 lg:mt-0
          `}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const accessible = canAccess(item);
              
              return (
                <div key={item.path}>
                  {accessible ? (
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 relative
                        ${isActive(item.path)
                          ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={20} />
                      <span className="font-medium flex-1">{item.name}</span>
                      
                      {/* ✅ NOUVEAU : Badge pour les nouvelles fonctionnalités */}
                      {item.badge && !isActive(item.path) && (
                        <span className={`
                          text-xs px-2 py-0.5 rounded-full font-semibold
                          ${item.badge === 'Nouveau' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="relative group">
                      <div
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed"
                      >
                        <Icon size={20} />
                        <span className="font-medium">{item.name}</span>
                        <FaCrown className="ml-auto text-yellow-500" size={16} />
                      </div>
                      {/* Tooltip */}
                      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                        Réservé aux comptes Premium
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* ✅ NOUVEAU : Section Phase 4 mise en avant */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-4 border border-primary-200">
                <div className="flex items-center space-x-2 mb-2">
                  <FaBrain className="text-primary-600 text-xl" />
                  <h3 className="font-bold text-gray-900 text-sm">Nouveau !</h3>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Découvre qui est vraiment compatible avec toi grâce à notre test scientifique
                </p>
                <Link
                  to="/compatibility-test"
                  className="block bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-3 py-2 rounded-lg text-sm font-semibold text-center hover:shadow-lg transition-all duration-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  🧠 Faire le test
                </Link>
              </div>
            </div>

            {/* Bouton Upgrade si gratuit */}
            {user?.accountType === 'gratuit' && (
              <div className="pt-4 mt-4 border-t border-gray-200">
                <Link
                  to="/pricing"
                  className="block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg font-semibold text-center hover:shadow-lg transition-all duration-200"
                >
                  <FaCrown className="inline mr-2" />
                  Passer à Premium
                </Link>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Jusqu'à 50 matchs compatibles
                </p>
              </div>
            )}
          </nav>
        </aside>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden mt-16"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;