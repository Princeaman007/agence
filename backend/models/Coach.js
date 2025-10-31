import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const coachSchema = new mongoose.Schema({
  // Informations de connexion
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: 6,
    select: false
  },
  
  // Informations personnelles
  firstName: {
    type: String,
    required: [true, 'Le prénom est requis']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est requis']
  },
  phone: String,
  photo: String,
  
  // Informations professionnelles
  specialization: {
    type: [String],
    default: []
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  experience: {
    type: Number,
    default: 0 // en années
  },
  certifications: [{
    name: String,
    issuedBy: String,
    dateObtained: Date
  }],
  
  // Clients assignés
  clients: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['actif', 'en_pause', 'termine'],
      default: 'actif'
    }
  }],
  
  // Disponibilité
  availability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }]
  },
  
  // Statistiques
  totalClients: {
    type: Number,
    default: 0
  },
  successfulMatches: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Statut
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Dates
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hasher le mot de passe
coachSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Comparer les mots de passe
coachSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Coach = mongoose.model('Coach', coachSchema);

export default Coach;