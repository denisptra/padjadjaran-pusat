import { Module } from '@nestjs/common';
import { RegionMembersController } from './region-members.controller';
import { RegionMembersService } from './region-members.service';

@Module({
  controllers: [RegionMembersController],
  providers: [RegionMembersService],
})
export class RegionMembersModule {}
