import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { RegionMembersService } from './region-members.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../../core/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { RequireAction } from '../../core/decorators/action-matrix.decorator';

@ApiTags('region-members')
@Controller('region-members')
@ApiBearerAuth()
@Roles(Role.admin_wilayah, Role.super_admin)
export class RegionMembersController {
  constructor(private readonly regionMembersService: RegionMembersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all members in the managed region' })
  @RequireAction('member:read')
  getRegionMembers(@Req() req: any) {
    return this.regionMembersService.getRegionMembers(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get regional member details' })
  @RequireAction('member:read')
  getRegionMemberById(@Param('id') id: string, @Req() req: any) {
    return this.regionMembersService.getRegionMemberById(req.user.id, id);
  }
}
