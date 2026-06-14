import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_FEATURE_KEY } from '../decorators/feature-control.decorator';
import { FeatureControlRepository } from '../repositories/feature-control.repository';

@Injectable()
export class FeatureControlGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureControlRepository: FeatureControlRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const featureKey = this.reflector.getAllAndOverride<string>(
      REQUIRE_FEATURE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!featureKey) {
      return true;
    }

    const feature = await this.featureControlRepository.findOne({
      key: featureKey,
    });

    if (!feature || !feature.isEnabled) {
      throw new NotFoundException(
        `Feature '${featureKey}' is currently disabled or not found.`,
      );
    }

    return true;
  }
}
