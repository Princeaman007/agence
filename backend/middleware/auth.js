import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Coach from '../models/Coach.js';

// Middleware pour protéger les routes (vérifier le token JWT)
export const protect = async (req, res, next) => {
  let token;

  // Vérifier si le token existe dans les headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extraire le token
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer l'utilisateur depuis la DB (sans le mot de passe)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      // Vérifier si le compte est actif
      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Votre compte a été désactivé'
        });
      }

      // Vérifier si le compte est bloqué
      if (req.user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'Votre compte a été bloqué'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de token:', error);
      return res.status(401).json({
        success: false,
        message: 'Non autorisé, token invalide ou expiré'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, aucun token fourni'
    });
  }
};

// Middleware pour vérifier l'email
export const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Veuillez vérifier votre email avant d\'accéder à cette fonctionnalité'
    });
  }
  next();
};

// Alias pour la vérification d'email (compatibilité avec le code existant)
export const isEmailVerified = requireEmailVerification;

// Middleware pour vérifier le type de compte
export const restrictTo = (...accountTypes) => {
  return (req, res, next) => {
    if (!accountTypes.includes(req.user.accountType)) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas la permission d\'effectuer cette action. Passez à un compte Premium ou VIP.'
      });
    }
    next();
  };
};

// Middleware pour vérifier si l'utilisateur est Premium
export const isPremium = (req, res, next) => {
  if (req.user && (req.user.accountType === 'premium' || req.user.accountType === 'vip')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux membres Premium. Passez à Premium pour débloquer cette fonctionnalité.'
    });
  }
};

// Middleware pour vérifier si l'utilisateur est VIP
export const isVIP = (req, res, next) => {
  if (req.user && req.user.accountType === 'vip') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux membres VIP exclusivement.'
    });
  }
};

// Middleware pour protéger les routes des coachs
export const protectCoach = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Récupérer le coach
      req.coach = await Coach.findById(decoded.id).select('-password');

      if (!req.coach) {
        return res.status(401).json({
          success: false,
          message: 'Coach non trouvé'
        });
      }

      if (!req.coach.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Votre compte coach a été désactivé'
        });
      }

      next();
    } catch (error) {
      console.error('Erreur de token coach:', error);
      return res.status(401).json({
        success: false,
        message: 'Non autorisé, token invalide ou expiré'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé, aucun token fourni'
    });
  }
};

// Générer un token JWT
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Export par défaut pour compatibilité
export default {
  protect,
  requireEmailVerification,
  isEmailVerified,
  restrictTo,
  isPremium,
  isVIP,
  protectCoach,
  generateToken
};