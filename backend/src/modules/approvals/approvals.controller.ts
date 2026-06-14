import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('approvals')
@Controller('approvals')
@ApiBearerAuth()
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Get all approvals with pagination' })
  @RequireAction('approval:read')
  findAll(@Query() query: any, @Req() req: any) {
    return this.approvalsService.findAll(query, req.user);
  }

  @Get('payments')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Get all payments for verification' })
  @RequireAction('payment:read')
  findAllPayments(@Query() query: any) {
    return this.approvalsService.findAllPayments(query);
  }

  @Get(':id')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Get approval details' })
  @RequireAction('approval:read')
  findOne(@Param('id') id: string) {
    return this.approvalsService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Approve a request' })
  @AuditAction('approval', 'approve')
  @RequireAction('approval:process')
  approve(@Param('id') id: string, @Req() req: any) {
    return this.approvalsService.approve(id, req.user.id);
  }

  @Patch(':id/reject')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Reject a request' })
  @AuditAction('approval', 'reject')
  @RequireAction('approval:process')
  reject(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.approvalsService.reject(id, req.user.id, notes);
  }

  @Patch(':id/request-revision')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Request revision for a request' })
  @AuditAction('approval', 'request_revision')
  @RequireAction('approval:process')
  requestRevision(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.approvalsService.requestRevision(id, req.user.id, notes);
  }

  @Patch(':id/close')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Close a request' })
  @AuditAction('approval', 'close')
  @RequireAction('approval:close')
  close(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.approvalsService.close(id, req.user.id, notes);
  }

  @Patch('payments/:id/verify')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Verify a payment' })
  @AuditAction('payment', 'verify')
  @RequireAction('payment:verify')
  verifyPayment(@Param('id') id: string, @Req() req: any) {
    return this.approvalsService.verifyPayment(id, req.user.id);
  }

  @Patch('payments/:id/reject')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Reject a payment' })
  @AuditAction('payment', 'reject')
  @RequireAction('payment:reject')
  rejectPayment(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.approvalsService.rejectPayment(id, req.user.id, notes);
  }
}
