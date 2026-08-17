import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pusl3120';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB connected successfully to ${uri.includes('@') ? 'MongoDB Atlas' : uri}`);
    // Auto-seed default departments and demo users if empty
    import('../utils/autoSeed.js').then(({ ensureDefaultData }) => {
      ensureDefaultData();
    }).catch(() => {});
  } catch (error) {
    console.warn(`[Database Warning] Could not immediately connect to MongoDB at ${uri}: ${error.message}`);
    console.info('[Database Info] The server is still running. Please ensure MongoDB is started or configure MONGODB_URI in server/.env.');
  }
}


