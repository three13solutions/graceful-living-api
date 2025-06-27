import express from 'express';
import cors from 'cors';
import applicationRoutes from './routes/application.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();
const port = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Enhanced CORS Configuration
app.use(cors({
  origin: [
    'https://glf-five.vercel.app',
    process.env.NODE_ENV === 'development' && 'http://localhost:3000'
  ].filter(Boolean),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Routes
app.use('/api', applicationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
});
