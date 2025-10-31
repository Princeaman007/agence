import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // Client et Coach
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true
  },
  
  // Date et heure
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30, // en minutes
    enum: [30, 60, 90]
  },
  
  // Type de rendez-vous
  appointmentType: {
    type: String,
    enum: ['first_meeting', 'follow_up', 'match_discussion', 'profile_review', 'relationship_advice'],
    default: 'follow_up'
  },
  
  // Statut
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  
  // Détails
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Notes du coach (privées)
  coachNotes: {
    before: String, // Notes avant le rendez-vous
    during: String, // Notes pendant
    after: String // Résumé après
  },
  
  // Feedback du client
  clientFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  },
  
  // Lien de visio (si en ligne)
  meetingLink: String,
  meetingType: {
    type: String,
    enum: ['video', 'phone', 'in_person'],
    default: 'video'
  },
  
  // Rappels
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  
  // Annulation
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'cancelledByModel'
  },
  cancelledByModel: {
    type: String,
    enum: ['User', 'Coach']
  },
  cancellationReason: String,
  cancelledAt: Date,
  
  // Dates
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

// Index pour optimiser les requêtes
appointmentSchema.index({ userId: 1, scheduledDate: -1 });
appointmentSchema.index({ coachId: 1, scheduledDate: -1 });
appointmentSchema.index({ scheduledDate: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;