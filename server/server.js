import 'dotenv/config';
import { validateEnv } from './src/config/env.js';
import connectDB from './src/config/db.js';
import app from './src/app.js';

// console.log("ENV CHECK:", process.env.MONGO_URI);
validateEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ScapIt server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();