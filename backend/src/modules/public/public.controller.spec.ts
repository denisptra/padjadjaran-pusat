import { Test, TestingModule } from '@nestjs/testing';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

describe('PublicController', () => {
  let controller: PublicController;

  const mockPublicService = {
    getHeroSliders: jest.fn(),
    getGuruBesar: jest.fn(),
    getNews: jest.fn(),
    getNewsBySlug: jest.fn(),
    getArticles: jest.fn(),
    getArticleBySlug: jest.fn(),
    getGallery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [{ provide: PublicService, useValue: mockPublicService }],
    }).compile();

    controller = module.get<PublicController>(PublicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
