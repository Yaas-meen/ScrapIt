import express       from 'express';
import cors          from 'cors';
import helmet        from 'helmet';
import morgan        from 'morgan';
import cookieParser  from 'cookie-parser';
import rateLimit     from 'express-rate-limit';
import routes        from './routes/index.js';
import errorHandler  from './middleware/errorHandler.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:4173', // Vite preview
];

if (process.env.PRODUCTION_URL) {
  ALLOWED_ORIGINS.push(process.env.PRODUCTION_URL);
}

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


const authLimiter = rateLimit({
  windowMs:  15 * 60 * 1000, // 15 minutes
  max:        20,             // 20 attempts per window
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test', // skip in tests
});

// General limit for all other API routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:       200,            // 200 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

app.use('/api/v1/auth', authLimiter);

app.use('/api/v1', generalLimiter);

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