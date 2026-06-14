import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),

        JWT_ACCESS_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(7),

        ENCRYPTION_KEY: Joi.string().length(32).required(),
        COOKIE_SECRET: Joi.string().required(),

        MAIL_PROVIDER: Joi.string()
          .valid('smtp', 'brevo', 'ethereal', 'resend')
          .default('ethereal'),
        SMTP_HOST: Joi.string().required(),
        SMTP_PORT: Joi.number().default(1025),
        SMTP_USER: Joi.string().allow(''),
        SMTP_PASS: Joi.string().allow(''),
        SMTP_SECURE: Joi.boolean().default(false),
        SMTP_FROM: Joi.string().required(),

        CLIENT_URL: Joi.string().uri().required(),
        APP_PORT: Joi.number().default(5000),
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),

        THROTTLE_TTL: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(100),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
