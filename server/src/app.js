import express       from 'express';
import cors          from 'cors';
import helmet        from 'helmet';
import morgan        from 'morgan';
import cookieParser  from 'cookie-parser';
import rateLimit     from 'express-rate-limit';
import routes        from './routes/index.js';
import errorHandler  from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://scrap-it-one.vercel.app',
  'https://scrap-p4nfc7aeb-yaas-meens-projects.vercel.app',
];

if (process.env.PRODUCTION_URL) {
  ALLOWED_ORIGINS.push(process.env.PRODUCTION_URL);
}

app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:       20,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:       200,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

app.use('/api/v1/auth', authLimiter);
app.use('/api/v1',      generalLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ScrapIt API is running',
    env:     process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

export default app;