import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  // Participants
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  // Dernier message
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: Date
  },
  
  // Messages non lus par participant
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  
  // Si un coach a initié cette conversation (match curé)
  initiatedByCoach: {
    type: Boolean,
    default: false
  },
  coachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach'
  },
  
  // Statut de la conversation
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  
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

// Index pour rechercher les conversations d'un utilisateur
conversationSchema.index({ participants: 1, updatedAt: -1 });

// Méthode pour trouver ou créer une conversation
conversationSchema.statics.findOrCreate = async function(participant1Id, participant2Id) {
  let conversation = await this.findOne({
    participants: { $all: [participant1Id, participant2Id] }
  });
  
  if (!conversation) {
    conversation = await this.create({
      participants: [participant1Id, participant2Id],
      unreadCount: {
        [participant1Id]: 0,
        [participant2Id]: 0
      }
    });
  }
  
  return conversation;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;