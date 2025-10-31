import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Informations de base
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas retourner le mot de passe par défaut
  },
  
  // Informations du profil
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },
  gender: {
    type: String,
    enum: ['homme', 'femme', 'autre'],
    required: [true, 'Le genre est requis']
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Photo de profil
  profilePhoto: {
    type: String,
    default: ''
  },
  photos: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Type de compte
  accountType: {
    type: String,
    enum: ['gratuit', 'premium', 'vip'],
    default: 'gratuit'
  },
  
  // Vérification email
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Reset password
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Limites pour utilisateurs gratuits
  dailyMessagesCount: {
    type: Number,
    default: 0
  },
  dailyMessagesLimit: {
    type: Number,
    default: 5
  },
  lastMessageReset: {
    type: Date,
    default: Date.now
  },
  dailyProfileViewsCount: {
    type: Number,
    default: 0
  },
  dailyProfileViewsLimit: {
    type: Number,
    default: 10
  },
  
  // Informations du profil détaillé
  bio: {
    type: String,
    maxlength: [500, 'La bio ne peut pas dépasser 500 caractères']
  },
  location: {
    city: String,
    country: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  
  // Préférences de recherche
  lookingFor: {
    gender: [String],
    ageRange: {
      min: {
        type: Number,
        default: 18
      },
      max: {
        type: Number,
        default: 99
      }
    },
    maxDistance: {
      type: Number,
      default: 50 // en km
    }
  },
  
  // Informations supplémentaires
  height: Number,
  education: String,
  occupation: String,
  relationshipGoal: {
    type: String,
    enum: ['relation_serieuse', 'mariage', 'amitie', 'a_definir']
  },
  
  // Pour les Premium/VIP
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach'
  },
  subscriptionEndDate: Date,
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'expired'],
    default: 'active'
  },
  
  // Statistiques
  profileViews: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Statut du compte
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Dates
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour la recherche géographique
userSchema.index({ 'location.coordinates': '2dsphere' });

// Hasher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un token de vérification email
userSchema.methods.generateEmailVerificationToken = function() {
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 heures
  
  return token;
};

// Méthode pour vérifier si l'utilisateur peut envoyer un message
userSchema.methods.canSendMessage = function() {
  if (this.accountType !== 'gratuit') {
    return true; // Premium et VIP ont des messages illimités
  }
  
  // Réinitialiser le compteur si c'est un nouveau jour
  const lastReset = new Date(this.lastMessageReset);
  const now = new Date();
  
  if (lastReset.toDateString() !== now.toDateString()) {
    this.dailyMessagesCount = 0;
    this.lastMessageReset = now;
  }
  
  return this.dailyMessagesCount < this.dailyMessagesLimit;
};

// Méthode pour incrémenter le compteur de messages
userSchema.methods.incrementMessageCount = function() {
  this.dailyMessagesCount += 1;
  return this.save();
};

// Calculer l'âge à partir de la date de naissance
userSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Retourner le profil public (sans données sensibles)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    age: this.age,
    gender: this.gender,
    profilePhoto: this.profilePhoto,
    photos: this.photos,
    bio: this.bio,
    location: this.location,
    education: this.education,
    occupation: this.occupation,
    relationshipGoal: this.relationshipGoal,
    accountType: this.accountType,
    isEmailVerified: this.isEmailVerified
  };
};

const User = mongoose.model('User', userSchema);

export default User;