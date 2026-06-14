import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../../core/repositories/user.repository';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { OtpTokenRepository } from '../../core/repositories/otp-token.repository';
import { RefreshTokenRepository } from '../../core/repositories/refresh-token.repository';
import { PasswordResetTokenRepository } from '../../core/repositories/password-reset-token.repository';
import { PrismaService } from '../../core/prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SecurityUtils } from '../../core/utils/security.utils';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: {} },
        { provide: MemberProfileRepository, useValue: {} },
        { provide: OtpTokenRepository, useValue: {} },
        { provide: RefreshTokenRepository, useValue: {} },
        { provide: PasswordResetTokenRepository, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: EmailService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        {
          provide: SecurityUtils,
          useValue: {
            encrypt: jest.fn((val) => val),
            decrypt: jest.fn((val) => val),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
