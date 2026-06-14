import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah, Role.member)
  @ApiOperation({ summary: 'Get all notifications for user' })
  findAll(@Request() req: any) {
    return this.notificationsService.findAll(req.user);
  }

  @Post('mark-all-read')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah, Role.member)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  @Roles(Role.super_admin, Role.admin_pusat, Role.admin_wilayah, Role.member)
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
