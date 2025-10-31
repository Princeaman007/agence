import { useState } from 'react';
import { FaEnvelopeOpen, FaCheckCircle } from 'react-icons/fa';
import { authService } from '../services/userService';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useStore';

const VerifyEmailNotice = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await authService.resendVerification();
      toast.success('Email de vérification renvoyé avec succès !');
    } catch (error) {
      toast.error('Erreur lors du renvoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-500 to-pink-500 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 p-6 rounded-full">
              <FaEnvelopeOpen className="text-6xl text-primary-500" />
            </div>
          </div>

          {/* Titre */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vérifiez votre email
          </h2>

          {/* Message */}
          <div className="space-y-4 text-gray-600">
            <p>
              Bonjour <span className="font-semibold text-primary-600">{user?.firstName}</span> !
            </p>
            <p>
              Nous avons envoyé un email de vérification à :
            </p>
            <p className="font-semibold text-lg text-gray-900">
              {user?.email}
            </p>
            <p>
              Veuillez cliquer sur le lien dans l'email pour activer votre compte et commencer à utiliser toutes les fonctionnalités de la plateforme.
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FaCheckCircle className="text-blue-500 mt-1 flex-shrink-0" />
              <div className="text-left text-sm text-gray-700">
                <p className="font-semibold mb-2">Que faire ensuite ?</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Consultez votre boîte de réception</li>
                  <li>Cherchez un email de notre part</li>
                  <li>Cliquez sur le lien de vérification</li>
                  <li>Commencez à utiliser votre compte !</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Renvoyer l'email */}
          <div className="mt-8">
            <p className="text-sm text-gray-600 mb-4">
              Vous n'avez pas reçu l'email ?
            </p>
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi en cours...' : 'Renvoyer l\'email'}
            </button>
          </div>

          {/* Note */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              💡 <span className="font-semibold">Astuce :</span> Vérifiez également votre dossier spam ou courrier indésirable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailNotice;