import { Test, TestingModule } from '@nestjs/testing';
import { CmsService } from './cms.service';
import { CmsPublicationRepository } from '../../core/repositories/cms-publication.repository';
import { CmsGalleryRepository } from '../../core/repositories/cms-gallery.repository';
import { CmsHeroSliderRepository } from '../../core/repositories/cms-hero-slider.repository';
import { CmsGuruBesarRepository } from '../../core/repositories/cms-guru-besar.repository';
import { PrismaService } from '../../core/prisma/prisma.service';

describe('CmsService', () => {
  let service: CmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsService,
        { provide: CmsPublicationRepository, useValue: {} },
        { provide: CmsGalleryRepository, useValue: {} },
        { provide: CmsHeroSliderRepository, useValue: {} },
        { provide: CmsGuruBesarRepository, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<CmsService>(CmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
