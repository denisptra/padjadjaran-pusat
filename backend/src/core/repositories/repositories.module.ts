import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityUtils } from '../utils/security.utils';
import { UserRepository } from './user.repository';
import { MemberProfileRepository } from './member-profile.repository';
import { RegionRepository } from './region.repository';
import { ApprovalRepository } from './approval.repository';
import { PaymentRepository } from './payment.repository';
import { AnnouncementRepository } from './announcement.repository';
import { AuditLogRepository } from './audit-log.repository';
import { ActionMatrixRepository } from './action-matrix.repository';
import { FeatureControlRepository } from './feature-control.repository';
import { PaymentSettingRepository } from './payment-setting.repository';
import { CmsPublicationRepository } from './cms-publication.repository';
import { CmsGalleryRepository } from './cms-gallery.repository';
import { CmsHeroSliderRepository } from './cms-hero-slider.repository';
import { CmsGuruBesarRepository } from './cms-guru-besar.repository';
import { OtpTokenRepository } from './otp-token.repository';
import { RefreshTokenRepository } from './refresh-token.repository';
import { PasswordResetTokenRepository } from './password-reset-token.repository';

const repositories = [
  UserRepository,
  MemberProfileRepository,
  RegionRepository,
  ApprovalRepository,
  PaymentRepository,
  AnnouncementRepository,
  AuditLogRepository,
  ActionMatrixRepository,
  FeatureControlRepository,
  PaymentSettingRepository,
  CmsPublicationRepository,
  CmsGalleryRepository,
  CmsHeroSliderRepository,
  CmsGuruBesarRepository,
  OtpTokenRepository,
  RefreshTokenRepository,
  PasswordResetTokenRepository,
];

@Global()
@Module({
  imports: [PrismaModule],
  providers: [...repositories, SecurityUtils],
  exports: [...repositories, SecurityUtils],
})
export class RepositoriesModule {}
