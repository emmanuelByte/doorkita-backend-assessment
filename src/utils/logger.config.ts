import pino from 'pino';

export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ignore: 'pid,hostname',
    },
  },
  base: {
    env: process.env.NODE_ENV || 'development',
    revision: process.env.npm_package_version || '1.0.0',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label: string) => {
      return { level: label };
    },
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
};

export const logger = pino(loggerConfig);
