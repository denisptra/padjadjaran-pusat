import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Body,
  Request,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { RegionsService } from './regions.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('regions')
@Controller('regions')
@ApiBearerAuth()
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get('provinces')
  @Public()
  @ApiOperation({ summary: 'Get all provinces' })
  findProvinces() {
    return this.regionsService.findProvinces();
  }

  @Post('provinces')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Create a new province/country' })
  @AuditAction('province', 'create')
  @RequireAction('region:create')
  createProvince(@Body() data: any) {
    return this.regionsService.createProvince(data);
  }

  @Patch('provinces/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Update province/country info' })
  @AuditAction('province', 'update')
  @RequireAction('region:update')
  updateProvince(@Param('id') id: string, @Body() data: any) {
    return this.regionsService.updateProvince(id, data);
  }

  @Delete('provinces/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Delete a province' })
  @AuditAction('province', 'delete')
  @RequireAction('region:delete')
  removeProvince(@Param('id') id: string) {
    return this.regionsService.removeProvince(id);
  }

  @Get('list')
  @Public()
  @ApiOperation({
    summary:
      'Get all active regions for selection, optionally filtered by provinceId',
  })
  findList(@Query('provinceId') provinceId?: string) {
    return this.regionsService.findActiveList(provinceId);
  }

  @Get()
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Get all regions with pagination' })
  @RequireAction('region:read')
  findAll(@Query() query: PaginationDto) {
    return this.regionsService.findAll(query);
  }

  @Get('profile')
  @Roles(Role.admin_wilayah)
  @ApiOperation({ summary: 'Get current admin region profile' })
  @RequireAction('region:read_profile')
  getProfile(@Request() req: any) {
    return this.regionsService.getProfile(req.user.id);
  }

  @Patch('profile')
  @Roles(Role.admin_wilayah)
  @ApiOperation({ summary: 'Update current admin region operational info' })
  @RequireAction('region:read_profile')
  updateProfile(@Request() req: any, @Body() dto: any) {
    return this.regionsService.updateProfile(req.user.id, dto);
  }

  @Post('bulk-action')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Perform bulk action on regions' })
  @AuditAction('region', 'bulk_action')
  @RequireAction('region:update')
  bulkAction(@Body() dto: { ids: string[]; action: string }) {
    return this.regionsService.bulkAction(dto.ids, dto.action);
  }

  @Get(':id')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Get region details' })
  @RequireAction('region:read')
  findOne(@Param('id') id: string) {
    return this.regionsService.findOne(id);
  }

  @Post()
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Create a new region' })
  @AuditAction('region', 'create')
  @RequireAction('region:create')
  create(@Body() data: any) {
    return this.regionsService.create(data);
  }

  @Patch(':id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Update region basic info' })
  @AuditAction('region', 'update')
  @RequireAction('region:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.regionsService.update(id, data);
  }

  @Patch(':id/activate')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Activate a region' })
  @AuditAction('region', 'activate')
  @RequireAction('region:update')
  activate(@Param('id') id: string) {
    return this.regionsService.activate(id);
  }

  @Patch(':id/assign-admin')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Assign admin to a region' })
  @AuditAction('region', 'assign_admin')
  @RequireAction('region:update')
  assignAdmin(@Param('id') id: string, @Body('adminId') adminId: string) {
    return this.regionsService.assignAdmin(id, adminId);
  }

  @Patch(':id/deactivate')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Deactivate a region' })
  @AuditAction('region', 'deactivate')
  @RequireAction('region:update')
  deactivate(@Param('id') id: string) {
    return this.regionsService.deactivate(id);
  }

  @Delete(':id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Delete a region' })
  @AuditAction('region', 'delete')
  @RequireAction('region:delete')
  remove(@Param('id') id: string) {
    return this.regionsService.remove(id);
  }
}
