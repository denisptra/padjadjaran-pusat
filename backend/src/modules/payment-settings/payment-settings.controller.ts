import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Req,
} from '@nestjs/common';
import { PaymentSettingsService } from './payment-settings.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('payment-settings')
@Controller('payment-settings')
@ApiBearerAuth()
export class PaymentSettingsController {
  constructor(
    private readonly paymentSettingsService: PaymentSettingsService,
  ) {}

  @Get()
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Get all payment settings' })
  @RequireAction('cms:update')
  async findAll(@Query() query: PaginationDto) {
    return this.paymentSettingsService.findAll(query);
  }

  @Patch(':id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Update payment setting' })
  @AuditAction('payment_setting', 'update')
  @RequireAction('payment_setting:update')
  async update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    try {
      console.log(
        `[PaymentSettingsController] User ${req.user?.id} (${req.user?.role}) updating ${id}`,
      );
      return await this.paymentSettingsService.update(id, data);
    } catch (err) {
      console.error(`[PaymentSettingsController] Error:`, err.message);
      throw err;
    }
  }
}
