import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationStatusGuard } from '../../core/guards/registration-status.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @UseGuards(RegistrationStatusGuard)
  @ApiOperation({ summary: 'Get dashboard summary based on role' })
  async getSummary(@Req() req: any, @Query('regionName') regionName?: string) {
    return this.dashboardService.getSummary(req.user, regionName);
  }
}
