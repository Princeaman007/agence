import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = './uploads/profiles';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique: userId_timestamp_randomString.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user._id}_${uniqueSuffix}${ext}`);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, JPG, PNG, GIF, WEBP) sont autorisées'));
  }
};

// Configuration de multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max par fichier
  },
  fileFilter: fileFilter
});

// Middleware pour vérifier le nombre de photos
export const checkPhotoLimit = async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    const User = (await import('../models/User.js')).default;
    const user = await User.findById(req.user._id);
    
    // Vérifier que l'utilisateur existe
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // ✅ CORRECTION: Vérifier si photos existe et est un tableau
    const photoCount = (user.photos && Array.isArray(user.photos)) ? user.photos.length : 0;
    
    // Définir les limites selon le type de compte
    const photoLimits = {
      gratuit: 3,
      premium: 6,
      vip: 10
    };
    
    const limit = photoLimits[user.accountType] || 3;
    
    if (photoCount >= limit) {
      return res.status(400).json({
        success: false,
        message: `Vous avez atteint la limite de ${limit} photos pour votre compte ${user.accountType}`,
        limitReached: true,
        currentCount: photoCount,
        maxLimit: limit
      });
    }
    
    // Ajouter les infos au req pour utilisation dans le contrôleur
    req.photoLimit = {
      current: photoCount,
      max: limit,
      remaining: limit - photoCount
    };
    
    next();
  } catch (error) {
    console.error('Erreur checkPhotoLimit:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification de la limite de photos',
      error: error.message
    });
  }
};

export default upload;