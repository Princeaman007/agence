import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaEnvelope, FaLock } from 'react-icons/fa';
import { authService } from '../services/userService';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useStore';

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.login(formData);
      
      toast.success('Connexion réussie !');
      setUser(response.data.user);
      setToken(response.data.token);
      
      // Vérifier si l'email est vérifié
      if (!response.data.isEmailVerified) {
        navigate('/verify-email-notice');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la connexion';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-pink-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <FaHeart className="text-5xl text-primary-500" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Bon Retour !
          </h2>
          <p className="text-white text-lg">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="Votre mot de passe"
                />
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-primary-600 hover:text-primary-500 font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connexion en cours...
                </span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          {/* Lien vers l'inscription */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" className="text-primary-500 font-semibold hover:text-primary-600">
                S'inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>

        {/* Avantages */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white font-bold text-2xl">10K+</p>
            <p className="text-white text-sm">Membres actifs</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white font-bold text-2xl">85%</p>
            <p className="text-white text-sm">Taux de réussite</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white font-bold text-2xl">500+</p>
            <p className="text-white text-sm">Mariages</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;