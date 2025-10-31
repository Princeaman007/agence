import User from '../models/User.js';
import fs from 'fs';
import path from 'path';

// @desc    Obtenir le profil d'un utilisateur
// @route   GET /api/users/:id
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    // ✅ Vérifier que l'ID est un ObjectId MongoDB valide
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur invalide'
      });
    }

    // Récupérer l'utilisateur
    const user = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est bloqué
    if (user.blockedUsers && user.blockedUsers.includes(currentUserId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas voir ce profil'
      });
    }

    // Si ce n'est pas son propre profil, incrémenter les vues
    if (id !== currentUserId.toString()) {
      // Vérifier les limites de vues quotidiennes pour les comptes gratuits
      const currentUser = await User.findById(currentUserId);
      
      if (currentUser.accountType === 'gratuit') {
        const dailyLimit = currentUser.dailyProfileViewsLimit || 10;
        const viewsCount = currentUser.dailyProfileViewsCount || 0;

        if (viewsCount >= dailyLimit) {
          return res.status(403).json({
            success: false,
            message: 'Limite quotidienne de vues de profils atteinte',
            limitReached: true
          });
        }

        // Incrémenter le compteur de vues quotidiennes
        await User.findByIdAndUpdate(currentUserId, {
          $inc: { dailyProfileViewsCount: 1 }
        });
      }

      // Incrémenter les vues du profil consulté
      await User.findByIdAndUpdate(id, {
        $inc: { profileViews: 1 }
      });
    }

    // Calculer l'âge
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const userWithAge = {
      ...user,
      age: calculateAge(user.dateOfBirth)
    };

    res.status(200).json({
      success: true,
      data: userWithAge
    });

  } catch (error) {
    console.error('Erreur getUserProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// @desc    Rechercher des utilisateurs avec filtres
// @route   GET /api/users/search
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    console.log('🔍 ===== DÉBUT searchUsers =====');
    console.log('👤 req.user._id:', req.user._id);
    
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      console.log('❌ Utilisateur actuel non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    console.log('✅ Utilisateur actuel trouvé:', currentUser.email);
    console.log('🔒 Blocked users:', currentUser.blockedUsers);
    
    // Récupérer les paramètres de recherche
    const {
      gender,
      ageMin,
      ageMax,
      city,
      country,
      relationshipGoal,
      page = 1,
      limit = 20
    } = req.query;

    console.log('📊 Paramètres de recherche:', { gender, ageMin, ageMax, city, country, relationshipGoal, page, limit });

    // Construire la requête de base
    const query = {
      _id: { $ne: req.user._id },
      isActive: true,
      isEmailVerified: true,
      $and: [
        { _id: { $nin: currentUser.blockedUsers || [] } },
        { blockedUsers: { $ne: req.user._id } }
      ]
    };

    if (gender) query.gender = gender;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (country) query['location.country'] = new RegExp(country, 'i');
    if (relationshipGoal) query.relationshipGoal = relationshipGoal;

    if (ageMin || ageMax) {
      const now = new Date();
      if (ageMax) {
        const minBirthDate = new Date(now.getFullYear() - parseInt(ageMax) - 1, now.getMonth(), now.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $gte: minBirthDate };
      }
      if (ageMin) {
        const maxBirthDate = new Date(now.getFullYear() - parseInt(ageMin), now.getMonth(), now.getDate());
        query.dateOfBirth = { ...query.dateOfBirth, $lte: maxBirthDate };
      }
    }

    console.log('🔍 Query MongoDB:', JSON.stringify(query, null, 2));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    console.log('📄 Pagination:', { pageNum, limitNum, skip });

    const users = await User.find(query)
      .select('firstName lastName dateOfBirth gender profilePhoto photos bio location occupation education relationshipGoal accountType interests hobbies isEmailVerified')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    console.log('📦 Utilisateurs trouvés:', users.length);
    if (users.length > 0) {
      console.log('👤 Premier utilisateur:', {
        id: users[0]._id,
        name: users[0].firstName + ' ' + users[0].lastName,
        email: users[0].email,
        isActive: users[0].isActive,
        isEmailVerified: users[0].isEmailVerified
      });
    }

    const total = await User.countDocuments(query);
    console.log('📊 Total utilisateurs correspondants:', total);

    // Vérifier combien d'users au total dans la DB
    const totalUsers = await User.countDocuments({});
    console.log('📊 Total users en DB:', totalUsers);

    // Vérifier combien ont isActive et isEmailVerified
    const activeVerifiedUsers = await User.countDocuments({ 
      isActive: true, 
      isEmailVerified: true 
    });
    console.log('📊 Users actifs et vérifiés:', activeVerifiedUsers);

    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    const usersWithAge = users.map(user => {
      const userObj = user.toObject();
      const age = calculateAge(user.dateOfBirth);
      return { ...userObj, age };
    });

    console.log('✅ Réponse envoyée avec', usersWithAge.length, 'utilisateurs');
    console.log('🔍 ===== FIN searchUsers =====\n');

    res.status(200).json({
      success: true,
      data: {
        users: usersWithAge,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('❌ ERREUR lors de la recherche:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche',
      error: error.message
    });
  }
};

// @desc    Mettre à jour son propre profil
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'bio', 'location',
      'lookingFor', 'height', 'education', 'occupation',
      'relationshipGoal', 'interests', 'languages', 'religion',
      'smoking', 'drinking', 'children'
    ];

    let hasUpdates = false;
    allowedUpdates.forEach(field => {
      const value = req.body[field];
      if (value !== undefined && value !== null && value !== '') {
        user[field] = value;
        hasUpdates = true;
      }
    });

    if (!hasUpdates) {
      return res.status(400).json({
        success: false,
        message: 'Aucune mise à jour fournie'
      });
    }

    await user.save({ validateBeforeSave: true });

    const publicProfile = user.toObject({ virtuals: true, versionKey: false });
    delete publicProfile.password;
    delete publicProfile.emailVerificationToken;
    delete publicProfile.resetPasswordToken;

    res.status(200).json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: publicProfile
    });

  } catch (error) {
    console.error('Erreur update profile:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// @desc    Uploader une photo
// @route   POST /api/users/upload-photo
// @access  Private
export const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.photos) user.photos = [];

    if (user.photos.length >= 6) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Limite de 6 photos atteinte'
      });
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    if (!user.profilePhoto) user.profilePhoto = photoUrl;

    user.photos.push({
      url: photoUrl,
      uploadedAt: new Date()
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Photo uploadée avec succès',
      data: {
        photoUrl,
        photos: user.photos,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Erreur upload',
      error: error.message
    });
  }
};

// @desc    Supprimer une photo
// @route   DELETE /api/users/photo/:photoId
// @access  Private
export const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const photo = user.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo non trouvée'
      });
    }

    const filePath = path.join(process.cwd(), photo.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    if (user.profilePhoto === photo.url) {
      user.profilePhoto = '';
      const remainingPhotos = user.photos.filter(p => p._id.toString() !== photoId);
      if (remainingPhotos.length > 0) {
        user.profilePhoto = remainingPhotos[0].url;
      }
    }

    user.photos.pull(photoId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Photo supprimée',
      data: {
        photos: user.photos,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (error) {
    console.error('Erreur suppression photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur suppression',
      error: error.message
    });
  }
};

// @desc    Définir photo de profil
// @route   PUT /api/users/profile-photo/:photoId
// @access  Private
export const setProfilePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const photo = user.photos.id(photoId);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo non trouvée'
      });
    }

    user.profilePhoto = photo.url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Photo de profil mise à jour',
      data: { profilePhoto: user.profilePhoto }
    });

  } catch (error) {
    console.error('Erreur set profile photo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur mise à jour photo',
      error: error.message
    });
  }
};

// @desc    Bloquer un utilisateur
// @route   POST /api/users/block/:userId
// @access  Private
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const userToBlock = await User.findById(userId);
    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur à bloquer non trouvé'
      });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas vous bloquer'
      });
    }

    if (user.blockedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Déjà bloqué'
      });
    }

    user.blockedUsers.push(userId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur bloqué',
      data: { blockedUsers: user.blockedUsers }
    });

  } catch (error) {
    console.error('Erreur blocage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur blocage',
      error: error.message
    });
  }
};

// @desc    Débloquer un utilisateur
// @route   DELETE /api/users/block/:userId
// @access  Private
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.blockedUsers.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Utilisateur non bloqué'
      });
    }

    user.blockedUsers.pull(userId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Utilisateur débloqué',
      data: { blockedUsers: user.blockedUsers }
    });

  } catch (error) {
    console.error('Erreur déblocage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur déblocage',
      error: error.message
    });
  }
};

export default {
  getUserProfile,
  updateProfile,
  uploadPhoto,
  deletePhoto,
  setProfilePhoto,
  blockUser,
  unblockUser,
  searchUsers
};