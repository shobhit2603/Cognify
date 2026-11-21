import app from './src/app.js';
import envConfig from './src/config/env.config.js';
import { connectDatabase } from './src/config/db.config.js';
import * as s3Storage from './src/services/storage/s3.storage.js';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start Express server
    app.listen(envConfig.PORT, () => {
      console.log(`\n Cognify - Server is running`);
      console.log(`   Environment : ${envConfig.NODE_ENV}`);
      console.log(`   Port        : ${envConfig.PORT}`);
      console.log(`   URL         : http://localhost:${envConfig.PORT}`);
      console.log(`   Health      : http://localhost:${envConfig.PORT}/api/v1/health\n`);
    });

    // Ensure S3 bucket has browser upload CORS enabled
    s3Storage.configureBucketCors().catch((err) => {
      console.warn('[Server Startup] S3 CORS initialization notice:', err.message);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
