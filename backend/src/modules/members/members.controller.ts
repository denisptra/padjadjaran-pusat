import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('members')
@Controller('members')
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // ===== STATIC ROUTES FIRST (must come before :id routes) =====

  @Get()
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Get all members with pagination, search, filter' })
  @RequireAction('member:read')
  async findAll(@Query() query: any, @Req() req: any) {
    return this.membersService.findAll(query, req.user, query.status);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current member profile' })
  @AuditAction('member', 'update_profile')
  async updateProfile(@Req() req: any, @Body() dto: any) {
    return this.membersService.updateProfile(req.user, dto);
  }

  @Post('documents')
  @ApiOperation({ summary: 'Upload registration documents' })
  @AuditAction('member', 'upload_documents')
  async uploadDocuments(@Req() req: any, @Body() dto: any) {
    return this.membersService.uploadDocuments(req.user, dto);
  }

  @Post('bulk-action')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Perform bulk action on members' })
  @AuditAction('member', 'bulk_action')
  async bulkAction(@Body() dto: { ids: string[]; action: string }) {
    return this.membersService.bulkAction(dto.ids, dto.action);
  }

  @Post()
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Create a new member directly' })
  @AuditAction('member', 'create')
  @RequireAction('member:create')
  async create(@Body() dto: any, @Req() req: any) {
    return this.membersService.create(dto, req.user);
  }

  // ===== DYNAMIC :id ROUTES =====

  @Get(':id')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Get a single member details' })
  @RequireAction('member:read')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.membersService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Update member details' })
  @AuditAction('member', 'update')
  @RequireAction('member:update')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.membersService.update(id, dto);
  }

  @Patch(':id/activate')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Activate a member account' })
  @AuditAction('member', 'activate')
  @RequireAction('member:update')
  async activate(@Param('id') id: string) {
    return this.membersService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Deactivate a member account' })
  @AuditAction('member', 'deactivate')
  @RequireAction('member:update')
  async deactivate(@Param('id') id: string) {
    return this.membersService.deactivate(id);
  }

  @Patch(':id/change-region')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Change member region' })
  @AuditAction('member', 'change_region')
  @RequireAction('member:update')
  async changeRegion(
    @Param('id') id: string,
    @Body('regionId') regionId: string,
  ) {
    return this.membersService.changeRegion(id, regionId);
  }

  @Patch(':id/assign-admin-wilayah')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Assign member as admin wilayah' })
  @AuditAction('member', 'assign_admin_wilayah')
  @RequireAction('region:assign_admin')
  async assignAdminWilayah(
    @Param('id') id: string,
    @Body('regionId') regionId: string,
  ) {
    return this.membersService.assignAdminWilayah(id, regionId);
  }

  @Patch(':id/revoke-admin-wilayah')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Revoke admin wilayah status' })
  @AuditAction('member', 'revoke_admin_wilayah')
  @RequireAction('region:assign_admin')
  async revokeAdminWilayah(@Param('id') id: string) {
    return this.membersService.revokeAdminWilayah(id);
  }

  @Post(':id/reject')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Reject a pending member registration' })
  @AuditAction('member', 'reject')
  @RequireAction('member:deactivate')
  async reject(@Param('id') id: string) {
    return this.membersService.reject(id);
  }
}
