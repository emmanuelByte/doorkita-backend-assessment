import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()',
    );

    // Add custom security headers
    res.setHeader('X-Doorkita-Version', '1.0.0');
    res.setHeader(
      'X-Doorkita-Environment',
      process.env.NODE_ENV || 'development',
    );

    // Block suspicious user agents
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousUserAgents = [
      'bot',
      'crawler',
      'spider',
      'scraper',
      'curl',
      'wget',
      'python',
      'java',
      'perl',
      'ruby',
    ];

    const isSuspicious = suspiciousUserAgents.some((agent) =>
      userAgent.toLowerCase().includes(agent),
    );

    if (isSuspicious && !req.url.includes('/api/docs')) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Suspicious user agent detected',
      });
    }

    // Rate limiting headers (if not already set by throttler)
    if (!res.getHeader('X-RateLimit-Limit')) {
      res.setHeader('X-RateLimit-Limit', '100');
      res.setHeader('X-RateLimit-Remaining', '99');
      res.setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + 60000).toISOString(),
      );
    }

    // Log security events
    this.logSecurityEvent(req);

    next();
  }

  private logSecurityEvent(req: Request) {
    const securityEvents = {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      url: req.url,
      referer: req.headers.referer,
      origin: req.headers.origin,
    };

    // Log to console in development, to security log in production
    if (process.env.NODE_ENV === 'development') {
      console.log('Security Event:', securityEvents);
    } else {
      // In production, you might want to log to a security monitoring service
      // or a dedicated security log file
      console.log('SECURITY:', JSON.stringify(securityEvents));
    }
  }
}
