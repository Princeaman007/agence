import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { initializeSocket } from './socket/socketHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import compatibilityRoutes from './routes/compatibility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

// Se connecter à la base de données
connectDB();

const app = express();

// Créer le serveur HTTP
const server = createServer(app);

// Initialiser Socket.io
const io = initializeSocket(server);

// Rendre io accessible dans les routes
app.set('io', io);

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/compatibility', compatibilityRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API de la plateforme de rencontre',
    version: '1.0.0',
    features: ['Authentication', 'User Management', 'Real-time Messaging']
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💬 Socket.io activé pour la messagerie en temps réel`);
});

// Gérer les rejets de promesses non capturés
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

export default app;