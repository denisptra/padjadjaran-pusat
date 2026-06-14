import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import { Public } from '../../core/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicationType } from '@prisma/client';

@ApiTags('public')
@Public()
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('hero-sliders')
  getHeroSliders() {
    return this.publicService.getHeroSliders();
  }

  @Get('guru-besar')
  getGuruBesar() {
    return this.publicService.getGuruBesar();
  }

  @Get('news')
  getNews() {
    return this.publicService.getPublications(PublicationType.BERITA);
  }

  @Get('news/:slug')
  getNewsBySlug(@Param('slug') slug: string) {
    return this.publicService.getPublicationBySlug(slug);
  }

  @Get('articles')
  getArticles() {
    return this.publicService.getPublications(PublicationType.ARTIKEL);
  }

  @Get('articles/:slug')
  getArticleBySlug(@Param('slug') slug: string) {
    return this.publicService.getPublicationBySlug(slug);
  }

  @Get('gallery')
  getGallery() {
    return this.publicService.getGallery();
  }

  @Get('cms-all')
  @ApiOperation({ summary: 'Get all public CMS content at once' })
  getCmsAll() {
    return this.publicService.getCmsAll();
  }

  @Get('regions')
  getRegions() {
    return this.publicService.getRegions();
  }

  @Get('provinces')
  getProvinces() {
    return this.publicService.getProvinces();
  }

  @Get('payment-settings')
  getPaymentSettings() {
    return this.publicService.getPaymentSettings();
  }

  @Get('verify-member/:ktaNumber')
  verifyMember(@Param('ktaNumber') ktaNumber: string) {
    return this.publicService.verifyMember(ktaNumber);
  }
}
