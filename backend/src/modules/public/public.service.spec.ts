import { Test, TestingModule } from '@nestjs/testing';
import { PublicService } from './public.service';
import { CmsHeroSliderRepository } from '../../core/repositories/cms-hero-slider.repository';
import { CmsGuruBesarRepository } from '../../core/repositories/cms-guru-besar.repository';
import { CmsPublicationRepository } from '../../core/repositories/cms-publication.repository';
import { CmsGalleryRepository } from '../../core/repositories/cms-gallery.repository';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('PublicService', () => {
  let service: PublicService;

  const mockCmsHeroSliderRepository = {
    findAll: jest.fn(),
  };

  const mockCmsGuruBesarRepository = {
    findAll: jest.fn(),
  };

  const mockCmsPublicationRepository = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCmsGalleryRepository = {
    findAll: jest.fn(),
  };

  const mockPrismaService = {
    region: {
      findMany: jest.fn(),
    },
    province: {
      findMany: jest.fn(),
    },
    memberProfile: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicService,
        {
          provide: CmsHeroSliderRepository,
          useValue: mockCmsHeroSliderRepository,
        },
        {
          provide: CmsGuruBesarRepository,
          useValue: mockCmsGuruBesarRepository,
        },
        {
          provide: CmsPublicationRepository,
          useValue: mockCmsPublicationRepository,
        },
        { provide: CmsGalleryRepository, useValue: mockCmsGalleryRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PublicService>(PublicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
