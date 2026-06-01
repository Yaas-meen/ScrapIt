import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();


app.use(helmet());

app.use(cors({
  origin: [
    'https://scrap-it-one.vercel.app/',  
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'ScrapIt API is running', env: process.env.NODE_ENV });
});


app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});


app.use(errorHandler);

export default app;