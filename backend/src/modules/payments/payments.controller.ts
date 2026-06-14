import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('payments')
@Controller('payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Get all payments with pagination' })
  @RequireAction('payment:read')
  findAll(@Query() query: PaginationDto) {
    return this.paymentsService.findAll(query);
  }

  @Get('my-status')
  @Roles(Role.member, Role.admin_wilayah, Role.admin_pusat, Role.super_admin)
  @ApiOperation({ summary: 'Get my payment history' })
  @RequireAction('payment:read_self')
  getMyStatus(@Request() req: any) {
    return this.paymentsService.getMyStatus(req.user.id);
  }

  @Get(':id')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Get payment details' })
  @RequireAction('payment:read_one')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id/verify')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Verify a payment' })
  @AuditAction('payment', 'verify')
  @RequireAction('payment:verify')
  verify(@Param('id') id: string) {
    return this.paymentsService.verify(id);
  }

  @Patch(':id/reject')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Reject a payment' })
  @AuditAction('payment', 'reject')
  @RequireAction('payment:reject')
  reject(@Param('id') id: string) {
    return this.paymentsService.reject(id);
  }

  @Post('confirm')
  @Roles(Role.member, Role.admin_wilayah, Role.admin_pusat, Role.super_admin)
  @ApiOperation({ summary: 'Confirm a payment (submit proof)' })
  @AuditAction('payment', 'confirm')
  @RequireAction('payment:confirm')
  confirm(
    @Request() req: any,
    @Body() body: { amount: number; proofUrl?: string; notes?: string },
  ) {
    return this.paymentsService.confirm(req.user.id, body);
  }
}
