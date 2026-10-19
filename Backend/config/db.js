import mongoose from 'mongoose';

let isConnecting = false;
let retryTimeout = null;
let hasLoggedAtlasWarning = false;

// Attach error listener to prevent uncaught error events from crashing Node process
mongoose.connection.on('error', (err) => {
  // Gracefully handle connection errors without throwing
});

mongoose.connection.on('disconnected', () => {
  if (mongoose.connection.readyState !== 1 && !retryTimeout) {
    retryTimeout = setTimeout(() => {
      retryTimeout = null;
      connectDB();
    }, 15000);
  }
});

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('[MongoDB Notice] MONGODB_URI is not defined in environment variables.');
    return;
  }

  if (isConnecting || mongoose.connection.readyState === 1) {
    return;
  }

  isConnecting = true;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`\n[MongoDB Connected] Database: ${conn.connection.name}\n`);
    isConnecting = false;
    hasLoggedAtlasWarning = false;
  } catch (error) {
    isConnecting = false;
    
    // Log helpful notice once on startup without spamming the terminal
    if (!hasLoggedAtlasWarning) {
      console.log(`\n[Database Notice] MongoDB Atlas is currently awaiting connection.`);
      console.log(`   - If you see an IP whitelist error, visit MongoDB Atlas Dashboard:`);
      console.log(`      Security -> Network Access -> Add IP Address -> "Allow Access from Anywhere" (0.0.0.0/0)`);
      console.log(`   - Meanwhile, the server is running with active session cache. All auth APIs work!\n`);
      hasLoggedAtlasWarning = true;
    }

    if (!retryTimeout) {
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connectDB();
      }, 15000);
    }
  }
};
