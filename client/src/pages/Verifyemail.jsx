import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { authService } from '../services/userService';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const response = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message);
        toast.success('Email vérifié avec succès !');
        
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Erreur lors de la vérification');
        toast.error('Échec de la vérification');
      }
    };

    if (token) {
      verifyEmailToken();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-pink-500 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Loading State */}
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-6 rounded-full">
                  <FaSpinner className="text-6xl text-blue-500 animate-spin" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Vérification en cours...
              </h2>
              <p className="text-gray-600">
                Veuillez patienter pendant que nous vérifions votre email.
              </p>
            </>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-6 rounded-full animate-bounce">
                  <FaCheckCircle className="text-6xl text-green-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Email Vérifié ! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Redirection vers la page de connexion dans quelques secondes...
                </p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 btn-primary w-full"
              >
                Se connecter maintenant
              </button>
            </>
          )}

          {/* Error State */}
          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <div className="bg-red-100 p-6 rounded-full">
                  <FaTimesCircle className="text-6xl text-red-500" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Échec de la vérification
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Raisons possibles :</strong>
                </p>
                <ul className="text-left text-sm text-gray-700 mt-2 space-y-1">
                  <li>• Le lien a expiré (valide 24h)</li>
                  <li>• Le lien a déjà été utilisé</li>
                  <li>• Le lien est invalide</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                Retour à la connexion
              </button>
              <p className="mt-4 text-sm text-gray-600">
                Besoin d'un nouveau lien ?{' '}
                <button
                  onClick={() => navigate('/resend-verification')}
                  className="text-primary-600 font-semibold hover:text-primary-700"
                >
                  Renvoyer l'email
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;