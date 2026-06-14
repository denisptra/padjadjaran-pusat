import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { PaymentSettingsService } from './payment-settings.service';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('cms')
@Controller('cms/payment-settings')
@ApiBearerAuth()
export class PaymentSettingsController {
  constructor(private readonly service: PaymentSettingsService) {}

  @Get()
  @Roles(Role.super_admin, Role.admin_pusat)
  getSettings() {
    return this.service.getSettings();
  }

  @Put()
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'update_payment_settings')
  @RequireAction('cms:update')
  updateSettings(@Body() data: any) {
    return this.service.updateSettings(data);
  }
}
