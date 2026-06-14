import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Public } from '../../core/decorators/public.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('cms')
@Controller('cms')
@ApiBearerAuth()
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // Hero Slider
  @Get('hero-sliders')
  @Public()
  findAllSliders(@Query() query: PaginationDto) {
    return this.cmsService.findAllSliders(query);
  }

  @Get('hero-sliders/:id')
  @Public()
  findOneSlider(@Param('id') id: string) {
    return this.cmsService.findOneSlider(id);
  }

  @Post('hero-sliders')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'create_slider')
  @RequireAction('cms:create')
  createSlider(@Body() data: any) {
    return this.cmsService.createSlider(data);
  }

  @Patch('hero-sliders/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'update_slider')
  @RequireAction('cms:update')
  updateSlider(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateSlider(id, data);
  }

  @Delete('hero-sliders/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'delete_slider')
  @RequireAction('cms:delete')
  deleteSlider(@Param('id') id: string) {
    return this.cmsService.deleteSlider(id);
  }

  @Post('hero-sliders/bulk-action')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'bulk_action_slider')
  @RequireAction('cms:update')
  bulkActionSlider(@Body() data: { ids: string[]; action: string }) {
    return this.cmsService.bulkActionSlider(data.ids, data.action);
  }

  // Guru Besar
  @Get('guru-besar')
  @Public()
  findAllGuruBesar(@Query() query: PaginationDto) {
    return this.cmsService.findAllGuruBesar(query);
  }

  @Get('guru-besar/:id')
  @Public()
  findOneGuruBesar(@Param('id') id: string) {
    return this.cmsService.findOneGuruBesar(id);
  }

  @Post('guru-besar')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'create_guru_besar')
  @RequireAction('cms:create')
  createGuruBesar(@Body() data: any) {
    return this.cmsService.createGuruBesar(data);
  }

  @Patch('guru-besar/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'update_guru_besar')
  @RequireAction('cms:update')
  updateGuruBesar(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateGuruBesar(id, data);
  }

  @Delete('guru-besar/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'delete_guru_besar')
  @RequireAction('cms:delete')
  deleteGuruBesar(@Param('id') id: string) {
    return this.cmsService.deleteGuruBesar(id);
  }

  @Post('guru-besar/bulk-action')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'bulk_action_guru_besar')
  @RequireAction('cms:update')
  bulkActionGuruBesar(@Body() data: { ids: string[]; action: string }) {
    return this.cmsService.bulkActionGuruBesar(data.ids, data.action);
  }

  // Publications (Unified)
  @Get('publications')
  @Public()
  findAllPublications(@Query() query: any) {
    return this.cmsService.findAllPublications(query);
  }

  @Get('publications/:id')
  @Public()
  findOnePublication(@Param('id') id: string) {
    return this.cmsService.findOnePublication(id);
  }

  @Post('publications/:id/record-view')
  @Public()
  @ApiOperation({ summary: 'Record a publication view' })
  recordPublicationView(@Param('id') id: string, @Body('sessionId') sessionId: string) {
    return this.cmsService.recordPublicationView(id, sessionId);
  }

  @Post('publications')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'create_publication')
  @RequireAction('cms:create')
  createPublication(@Body() data: any) {
    return this.cmsService.createPublication(data);
  }

  @Patch('publications/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'update_publication')
  @RequireAction('cms:update')
  updatePublication(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updatePublication(id, data);
  }

  @Delete('publications/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'delete_publication')
  @RequireAction('cms:delete')
  deletePublication(@Param('id') id: string) {
    return this.cmsService.deletePublication(id);
  }

  @Post('publications/bulk-action')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'bulk_action_publication')
  @RequireAction('cms:update')
  bulkActionPublication(@Body() data: { ids: string[]; action: string }) {
    return this.cmsService.bulkActionPublication(data.ids, data.action);
  }

  // Gallery
  @Get('gallery')
  @Public()
  findAllGallery(@Query() query: PaginationDto) {
    return this.cmsService.findAllGallery(query);
  }

  @Get('gallery/:id')
  @Public()
  findOneGallery(@Param('id') id: string) {
    return this.cmsService.findOneGallery(id);
  }

  @Post('gallery')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'create_gallery')
  @RequireAction('cms:create')
  createGallery(@Body() data: any) {
    return this.cmsService.createGallery(data);
  }

  @Patch('gallery/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'update_gallery')
  @RequireAction('cms:update')
  updateGallery(@Param('id') id: string, @Body() data: any) {
    return this.cmsService.updateGallery(id, data);
  }

  @Delete('gallery/:id')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'delete_gallery')
  @RequireAction('cms:delete')
  deleteGallery(@Param('id') id: string) {
    return this.cmsService.deleteGallery(id);
  }

  @Post('gallery/bulk-action')
  @Roles(Role.super_admin, Role.admin_pusat)
  @AuditAction('cms', 'bulk_action_gallery')
  @RequireAction('cms:update')
  bulkActionGallery(@Body() data: { ids: string[]; action: string }) {
    return this.cmsService.bulkActionGallery(data.ids, data.action);
  }

  @Get('public-all')
  @Public()
  @ApiOperation({ summary: 'Get all public CMS content at once' })
  async findPublicAll() {
    return this.cmsService.findPublicAll();
  }
}
