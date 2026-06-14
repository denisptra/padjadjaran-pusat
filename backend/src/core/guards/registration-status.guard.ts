import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RegistrationStatusGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming JwtAuthGuard is applied before this

    if (!user || (!user.id && !user.sub)) return false;

    // Fetch user with profile to check registrationStep
    const userData = await this.prisma.user.findUnique({
      where: { id: user.id || user.sub },
      include: { profile: true },
    });

    if (!userData) return false;

    // Check registration steps (0: init, 1: verify, 2: biodata, 3: documents, 4: complete)
    // AuthService considers < 3 as PROFILE_INCOMPLETE
    const REQUIRED_STEPS = 3;
    const registrationStep = userData.profile?.registrationStep || 0;
    if (userData.role === 'member' && registrationStep < REQUIRED_STEPS) {
      throw new ForbiddenException('Registration incomplete');
    }

    // Check manual approval from admin
    const approval = await this.prisma.approval.findFirst({
      where: {
        creatorId: userData.id,
        type: 'registration',
        status: 'approved',
      },
    });

    if (!approval && userData.role === 'member') {
      throw new ForbiddenException('Waiting for admin approval');
    }

    return true;
  }
}
