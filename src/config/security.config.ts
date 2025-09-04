import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const securityConfig = {
  // Rate limiting configuration
  throttler: {
    throttlers: [
      {
        ttl: 60, // Time window in seconds
        limit: 100, // Maximum number of requests per time window
      },
    ],
  } as ThrottlerModuleOptions,

  // CORS configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://13.48.195.146:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  // Helmet configuration for security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https:', 'https://cdn.jsdelivr.net'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        manifestSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  },

  // Rate limiting for specific endpoints
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  },

  // Slow down configuration for brute force protection
  slowDown: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 5, // Allow 5 requests per 15 minutes, then...
    delayMs: 500, // Add 500ms delay per request above 5
  },

  // JWT configuration
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
  },

  // Password policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },

  // Session configuration
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  },
};
