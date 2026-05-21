import 'dotenv/config';
import { validateEnv } from './src/config/env.js';
import connectDB from './src/config/db.js';
import app from './src/app.js';

validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ScapIt server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('Forcing exit after timeout');
      process.exit(1);
    }, 10_000);
  };

startServer();