import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { useAuthStore } from '../../store/useStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  const navLinks = [
    { name: 'Accueil', path: '/', hash: '' },
    { name: 'Fonctionnalités', path: '/', hash: '#features' },
    { name: 'Tarifs', path: '/', hash: '#pricing' },
    { name: 'Témoignages', path: '/', hash: '#testimonials' },
  ];

  const scrollToSection = (hash) => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <FaHeart className="text-2xl text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Dating Platform
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path + link.hash}
                onClick={(e) => {
                  if (link.hash) {
                    e.preventDefault();
                    scrollToSection(link.hash);
                  }
                }}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              // Si connecté : Afficher Dashboard + Avatar
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Mon Dashboard
                </Link>
                <Link to="/dashboard" className="flex items-center">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.firstName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                  )}
                </Link>
              </>
            ) : (
              // Si déconnecté : Afficher Connexion + S'inscrire
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-all"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path + link.hash}
                onClick={(e) => {
                  if (link.hash) {
                    e.preventDefault();
                    scrollToSection(link.hash);
                  }
                  setIsMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-primary-600 font-medium py-2"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                // Si connecté : Dashboard
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Mon Dashboard
                </Link>
              ) : (
                // Si déconnecté : Connexion + S'inscrire
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-center bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;