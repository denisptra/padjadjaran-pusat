import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './core/prisma/prisma.module';
import { ConfigModule } from './core/config/config.module';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { MeModule } from './modules/me/me.module';
import { MembersModule } from './modules/members/members.module';
import { RegionsModule } from './modules/regions/regions.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CmsModule } from './modules/cms/cms.module';
import { PublicModule } from './modules/public/public.module';
import { SuperAdminModule } from './modules/super-admin/super-admin.module';
import { FilesModule } from './modules/files/files.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { RegionMembersModule } from './modules/region-members/region-members.module';
import { PaymentSettingsModule } from './modules/payment-settings/payment-settings.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

import { RepositoriesModule } from './core/repositories/repositories.module';

import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { ActionMatrixGuard } from './core/guards/action-matrix.guard';
import { FeatureControlGuard } from './core/guards/feature-control.guard';
import { RegistrationStatusGuard } from './core/guards/registration-status.guard';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
import { AuditLogInterceptor } from './core/interceptors/audit-log.interceptor';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    RepositoriesModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL') || 60000,
          limit: config.get<number>('THROTTLE_LIMIT') || 100,
        },
      ],
    }),
    AuthModule,
    EmailModule,
    MeModule,
    MembersModule,
    RegionsModule,
    ApprovalsModule,
    PaymentsModule,
    AnnouncementsModule,
    NotificationsModule,
    CmsModule,
    PublicModule,
    SuperAdminModule,
    FilesModule,
    AuditLogModule,
    DashboardModule,
    RegionMembersModule,
    PaymentSettingsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ActionMatrixGuard },
    { provide: APP_GUARD, useClass: FeatureControlGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
