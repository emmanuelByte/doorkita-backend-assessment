# Doorkita Healthcare Platform - Security Documentation

## 🔒 Security Overview

The Doorkita Healthcare Platform implements comprehensive security measures to protect sensitive healthcare data and ensure compliance with healthcare regulations (HIPAA, GDPR, etc.).

## 🛡️ Security Features Implemented

### 1. **Rate Limiting & DDoS Protection**

- **Global Rate Limiting**: 100 requests per 15-minute window per IP
- **Authentication Endpoint Protection**: Stricter limits on login/register endpoints
- **Slow-Down Protection**: Progressive delays for suspicious activity
- **Custom Throttler**: IP-based tracking with configurable limits

### 2. **Security Headers (Helmet)**

- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Additional XSS protection
- **Strict-Transport-Security**: Enforces HTTPS
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Restricts browser features

### 3. **CORS Protection**

- **Origin Validation**: Only allows specified origins
- **Method Restrictions**: Limits HTTP methods
- **Header Restrictions**: Controls allowed headers
- **Credentials**: Secure cookie handling

### 4. **Password Security**

- **Minimum Length**: 8 characters
- **Complexity Requirements**: Uppercase, lowercase, numbers, special characters
- **Weak Password Detection**: Blocks common passwords
- **Pattern Detection**: Prevents keyboard patterns
- **Sequential Character Check**: Prevents repeated characters
- **Strength Scoring**: Weak, medium, strong classification

### 5. **JWT Authentication**

- **Secure Secret**: Environment-based JWT secret
- **Token Expiration**: 24-hour access tokens
- **Role-Based Access**: Doctor, Lab, Patient roles
- **Secure Storage**: HTTP-only cookies in production

### 6. **Audit Logging**

- **Comprehensive Tracking**: All API calls logged
- **User Context**: User ID, role, IP address
- **Action Tracking**: CREATE, READ, UPDATE, DELETE, LOGIN, etc.
- **Resource Tracking**: USER, LAB_ORDER, RESULT, etc.
- **Performance Monitoring**: Response time tracking
- **Compliance Ready**: HIPAA-compliant logging

### 7. **Input Validation**

- **Request Validation**: All inputs validated
- **SQL Injection Prevention**: TypeORM with parameterized queries
- **XSS Prevention**: Input sanitization
- **Type Safety**: TypeScript strict mode

### 8. **Error Handling**

- **Secure Error Messages**: No sensitive information leaked
- **Structured Error Responses**: Consistent error format
- **Logging**: All errors logged for monitoring

## 🔧 Configuration

### Environment Variables

```bash
# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres123
DATABASE_NAME=doorkita_db
```

### Security Configuration File

```typescript
// src/config/security.config.ts
export const securityConfig = {
  throttler: {
    throttlers: [{ ttl: 60, limit: 100 }],
  },
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP',
  },
  slowDown: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 5, // Allow 5 requests per 15 minutes
    delayMs: 500, // Add 500ms delay per request above 5
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
};
```

## 🚀 Security Endpoints

### Health Check

```bash
GET /health
# Returns application health status

GET /health/security
# Returns security feature status
```

### Security Headers Example

```http
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 894
```

## 📊 Security Monitoring

### Audit Log Structure

```json
{
  "id": 1,
  "userId": 1,
  "userRole": "doctor",
  "action": "create",
  "resourceType": "lab_order",
  "resourceId": "123",
  "description": "Created new lab order for patient",
  "metadata": {
    "patientId": 3,
    "testType": "blood_test"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "endpoint": "/lab-orders",
  "method": "POST",
  "statusCode": 201,
  "responseTime": 150,
  "timestamp": "2025-09-04T21:04:19.446Z"
}
```

### Security Events Logged

- **Authentication**: Login, logout, registration attempts
- **Data Access**: All CRUD operations
- **System Events**: Health checks, configuration changes
- **Security Events**: Failed authentication, rate limit violations
- **Performance**: Response times, slow queries

## 🔍 Security Testing

### Password Validation Test

```bash
# Weak password (should fail)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123","firstName":"Test","lastName":"User","role":"patient"}'

# Strong password (should succeed)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"StrongPass123!","firstName":"Test","lastName":"User","role":"patient"}'
```

### Rate Limiting Test

```bash
# Make multiple requests to test rate limiting
for i in {1..10}; do
  curl -X GET http://localhost:3000/health \
    -H "accept: application/json" \
    -w "Request $i: %{http_code}\n"
done
```

### Security Headers Test

```bash
# Check security headers
curl -I http://localhost:3000/health
```

## 🛠️ Security Best Practices

### Development

1. **Never commit secrets**: Use environment variables
2. **Use HTTPS**: Always in production
3. **Validate inputs**: All user inputs validated
4. **Log security events**: Monitor for suspicious activity
5. **Regular updates**: Keep dependencies updated

### Production

1. **Strong JWT Secret**: Use cryptographically secure secret
2. **Database Security**: Use connection pooling, prepared statements
3. **Network Security**: Use VPN, firewall rules
4. **Monitoring**: Set up security monitoring and alerts
5. **Backup Security**: Encrypt backups, secure storage

### Compliance

1. **HIPAA Compliance**: All healthcare data encrypted
2. **GDPR Compliance**: User consent, data portability
3. **Audit Trails**: Complete audit logging
4. **Access Controls**: Role-based access control
5. **Data Minimization**: Only collect necessary data

## 🚨 Security Incident Response

### Immediate Actions

1. **Isolate**: Block suspicious IPs
2. **Investigate**: Check audit logs
3. **Notify**: Alert security team
4. **Document**: Record incident details
5. **Remediate**: Fix security issues

### Post-Incident

1. **Analysis**: Root cause analysis
2. **Lessons Learned**: Update security measures
3. **Monitoring**: Enhanced monitoring
4. **Training**: Security awareness training
5. **Review**: Security policy review

## 📈 Security Metrics

### Key Performance Indicators

- **Authentication Success Rate**: >95%
- **Response Time**: <200ms average
- **Error Rate**: <1%
- **Security Incidents**: 0 per month
- **Compliance Score**: 100%

### Monitoring Dashboard

- **Real-time Alerts**: Security events
- **Performance Metrics**: Response times, throughput
- **Security Status**: Feature health checks
- **Audit Reports**: Compliance reports
- **Threat Intelligence**: Security updates

## 🔐 Future Security Enhancements

### Planned Features

1. **Multi-Factor Authentication (MFA)**
2. **API Key Management**
3. **Advanced Threat Detection**
4. **Encryption at Rest**
5. **Zero Trust Architecture**

### Security Roadmap

- **Q1**: MFA implementation
- **Q2**: Advanced monitoring
- **Q3**: Penetration testing
- **Q4**: Security certification

---

## 📞 Security Contact

For security issues or questions:

- **Email**: security@doorkita.com
- **Phone**: +1-555-SECURITY
- **Emergency**: 24/7 security hotline

**Remember**: Security is everyone's responsibility. Report suspicious activity immediately.
