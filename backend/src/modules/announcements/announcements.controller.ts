import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('announcements')
@Controller('announcements')
@ApiBearerAuth()
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah, Role.member)
  @ApiOperation({ summary: 'Get all announcements with pagination' })
  @RequireAction('announcement:read')
  findAll(@Query() query: PaginationDto, @Request() req: any) {
    return this.announcementsService.findAll(query, req.user);
  }

  @Get(':id')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah, Role.member)
  @ApiOperation({ summary: 'Get announcement details' })
  @RequireAction('announcement:read_one')
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Post()
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Create an announcement' })
  @AuditAction('announcement', 'create')
  @RequireAction('announcement:create')
  create(@Body() data: any, @Request() req: any) {
    return this.announcementsService.create(data, req.user);
  }

  @Patch(':id')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Update an announcement' })
  @AuditAction('announcement', 'update')
  @RequireAction('announcement:update')
  update(@Param('id') id: string, @Body() data: any, @Request() req: any) {
    return this.announcementsService.update(id, data, req.user);
  }

  @Delete(':id')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah)
  @ApiOperation({ summary: 'Delete an announcement' })
  @AuditAction('announcement', 'delete')
  @RequireAction('announcement:delete')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.announcementsService.delete(id, req.user);
  }

  @Post(':id/read')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah, Role.member)
  @ApiOperation({ summary: 'Mark announcement as read' })
  @RequireAction('announcement:read')
  read(@Param('id') id: string, @Request() req: any) {
    return this.announcementsService.read(id, req.user.id);
  }

  @Patch(':id/publish')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Publish an announcement' })
  @AuditAction('announcement', 'publish')
  @RequireAction('announcement:publish')
  publish(@Param('id') id: string) {
    return this.announcementsService.publish(id);
  }

  @Patch(':id/unpublish')
  @Roles(Role.super_admin, Role.admin_pusat)
  @ApiOperation({ summary: 'Unpublish an announcement' })
  @AuditAction('announcement', 'unpublish')
  @RequireAction('announcement:unpublish')
  unpublish(@Param('id') id: string) {
    return this.announcementsService.unpublish(id);
  }
}
