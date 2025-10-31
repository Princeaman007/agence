import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    
    // Gérer les événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB déconnecté');
    });

    // Fermer la connexion proprement lors de l'arrêt de l'app
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connexion fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;