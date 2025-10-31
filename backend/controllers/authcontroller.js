import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailService.js';

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Un compte existe déjà avec cet email'
      });
    }

    // Calculer l'âge
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'Vous devez avoir au moins 18 ans pour vous inscrire'
      });
    }

    // Créer l'utilisateur
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender
    });

    // Générer le token de vérification email
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Construire l'URL de vérification
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

    // Envoyer l'email de vérification
    try {
      await sendVerificationEmail(email, firstName, verificationToken);
      console.log('✅ Email de vérification envoyé avec succès à:', email);
    } catch (emailError) {
      console.error('❌ Erreur d\'envoi d\'email:', emailError.message);
      console.log('🔗 LIEN DE VÉRIFICATION (pour le développement):');
      console.log(verificationUrl);
      console.log('---');
    }

    // Toujours afficher le lien en mode développement
    if (process.env.NODE_ENV === 'development') {
      console.log('🔗 LIEN DE VÉRIFICATION:');
      console.log(verificationUrl);
      console.log('---');
    }

    // Générer le token JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
      data: {
        user: user.getPublicProfile(),
        token,
        emailSent: true,
        // En développement, inclure le lien
        ...(process.env.NODE_ENV === 'development' && { verificationUrl })
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// @desc    Connexion utilisateur
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Vérifier si l'utilisateur existe (avec le mot de passe)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été désactivé'
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: user.getPublicProfile(),
        token,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// @desc    Vérifier l'email avec le token
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Trouver l'utilisateur avec ce token qui n'a pas expiré
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de vérification invalide ou expiré'
      });
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Envoyer l'email de bienvenue
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Erreur d\'envoi de l\'email de bienvenue:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Email vérifié avec succès ! Votre compte est maintenant actif.'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de l\'email',
      error: error.message
    });
  }
};

// @desc    Renvoyer l'email de vérification
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerificationEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Votre email est déjà vérifié'
      });
    }

    // Générer un nouveau token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Envoyer l'email
    await sendVerificationEmail(user.email, user.firstName, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Email de vérification renvoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du renvoi de l\'email:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du renvoi de l\'email de vérification',
      error: error.message
    });
  }
};

// @desc    Demander la réinitialisation du mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun compte trouvé avec cet email'
      });
    }

    // Générer le token de réinitialisation
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 heure
    await user.save();

    // Envoyer l'email
    await sendPasswordResetEmail(email, user.firstName, resetToken);

    res.status(200).json({
      success: true,
      message: 'Email de réinitialisation envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation',
      error: error.message
    });
  }
};

// @desc    Réinitialiser le mot de passe
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Trouver l'utilisateur avec ce token valide
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de réinitialisation invalide ou expiré'
      });
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: error.message
    });
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations',
      error: error.message
    });
  }
};

export default {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  getMe
};