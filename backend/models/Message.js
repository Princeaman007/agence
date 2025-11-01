import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Conversation
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  
  // Expéditeur et destinataire
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contenu
  content: {
    type: String,
    required: [true, 'Le message ne peut pas être vide'],
    trim: true,
    maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères']
  },
  
  // Type de message
  messageType: {
    type: String,
    enum: ['text', 'image', 'first_contact'],
    default: 'text'
  },
  
  // Pièce jointe (si image)
  attachment: {
    url: String,
    type: String
  },
  
  // Statut
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Date
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;