import { Injectable, NotFoundException } from '@nestjs/common';
import { CmsHeroSliderRepository } from '../../core/repositories/cms-hero-slider.repository';
import { CmsGuruBesarRepository } from '../../core/repositories/cms-guru-besar.repository';
import { CmsPublicationRepository } from '../../core/repositories/cms-publication.repository';
import { CmsGalleryRepository } from '../../core/repositories/cms-gallery.repository';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PublicationType } from '@prisma/client';

@Injectable()
export class PublicService {
  constructor(
    private readonly heroSliderRepository: CmsHeroSliderRepository,
    private readonly guruBesarRepository: CmsGuruBesarRepository,
    private readonly publicationRepository: CmsPublicationRepository,
    private readonly galleryRepository: CmsGalleryRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getHeroSliders() {
    return this.heroSliderRepository.findAll({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getGuruBesar() {
    return this.guruBesarRepository.findAll({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getPublications(type?: PublicationType) {
    return this.publicationRepository.findAll({
      where: {
        isPublished: true,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPublicationBySlug(slug: string) {
    const pub = await this.publicationRepository.findOne({ slug });
    if (!pub || !pub.isPublished) {
      throw new NotFoundException('Publication not found');
    }
    return pub;
  }

  async getGallery() {
    return this.galleryRepository.findAll({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRegions() {
    return this.prisma.region.findMany({
      where: { isActive: true },
      include: {
        province: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getProvinces() {
    return this.prisma.province.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getPaymentSettings() {
    return this.prisma.paymentSetting.findFirst({
      where: { type: 'REGISTRATION', isActive: true },
    });
  }

  async verifyMember(ktaNumber: string) {
    const member = await this.prisma.memberProfile.findFirst({
      where: { ktaNumber },
      include: {
        region: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Nomor KTA tidak ditemukan');
    }

    return member;
  }

  async getCmsAll() {
    const [sliders, gurus, publications, gallery] = await Promise.all([
      this.getHeroSliders(),
      this.getGuruBesar(),
      this.getPublications(),
      this.getGallery(),
    ]);

    return {
      sliders,
      gurus,
      publications,
      gallery,
    };
  }
}
