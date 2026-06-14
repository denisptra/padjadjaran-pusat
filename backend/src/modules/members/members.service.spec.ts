import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { MemberProfileRepository } from '../../core/repositories/member-profile.repository';
import { UserRepository } from '../../core/repositories/user.repository';
import { SecurityUtils } from '../../core/utils/security.utils';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('MembersService', () => {
  let service: MembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: MemberProfileRepository, useValue: {} },
        { provide: UserRepository, useValue: {} },
        { provide: SecurityUtils, useValue: {} },
        { provide: NotificationsService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
