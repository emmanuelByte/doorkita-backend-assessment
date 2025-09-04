import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the health status of the application',
  })
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      service: 'Doorkita Healthcare API',
    };
  }

  @ApiOperation({
    summary: 'Security status endpoint',
    description:
      'Returns security-related information (limited info for security)',
  })
  @Get('security')
  getSecurityStatus() {
    return {
      status: 'secure',
      timestamp: new Date().toISOString(),
      features: {
        rateLimiting: 'enabled',
        cors: 'enabled',
        helmet: 'enabled',
        passwordValidation: 'enabled',
        auditLogging: 'enabled',
        jwtAuth: 'enabled',
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
