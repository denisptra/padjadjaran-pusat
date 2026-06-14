import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserRepository } from '../../../core/repositories/user.repository';
import { SecurityUtils } from '../../../core/utils/security.utils';
import { UserStatus } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userRepository: UserRepository,
    private securityUtils: SecurityUtils,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let encryptedToken = request?.cookies?.accessToken;
          if (!encryptedToken && request?.headers?.authorization) {
            const parts = request.headers.authorization.split(' ');
            if (parts[0] === 'Bearer' && parts[1]) {
              encryptedToken = parts[1];
            }
          }
          if (!encryptedToken) return null;
          try {
            return securityUtils.decrypt(encryptedToken);
          } catch (e) {
            return null;
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'access-secret-123',
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({ id: payload.sub });
    if (!user || user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
