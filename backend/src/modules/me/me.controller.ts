import { Controller, Get, Post, Body, Req, Patch } from '@nestjs/common';
import { MeService } from './me.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditAction } from '../../core/decorators/audit-log.decorator';

@ApiTags('me')
@Controller('me')
@ApiBearerAuth()
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Req() req: any) {
    return this.meService.getMe(req.user.id);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Update password' })
  @AuditAction('me', 'update_password')
  async updatePassword(@Req() req: any, @Body() dto: any) {
    return this.meService.updatePassword(req.user.id, dto);
  }

  @Get('kta')
  @ApiOperation({ summary: 'Get KTA link' })
  async getKta(@Req() req: any) {
    return this.meService.getKta(req.user.id);
  }
}
