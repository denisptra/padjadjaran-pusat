import { Injectable, NotFoundException } from '@nestjs/common';
import { CmsPublicationRepository } from '../../core/repositories/cms-publication.repository';
import { CmsGalleryRepository } from '../../core/repositories/cms-gallery.repository';
import { CmsHeroSliderRepository } from '../../core/repositories/cms-hero-slider.repository';
import { CmsGuruBesarRepository } from '../../core/repositories/cms-guru-besar.repository';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PrismaService } from '../../core/prisma/prisma.service';
import { PublicationType } from '@prisma/client';

@Injectable()
export class CmsService {
  constructor(
    private readonly publicationRepository: CmsPublicationRepository,
    private readonly galleryRepository: CmsGalleryRepository,
    private readonly sliderRepository: CmsHeroSliderRepository,
    private readonly guruBesarRepository: CmsGuruBesarRepository,
    private readonly prisma: PrismaService,
  ) {}

  // Hero Slider
  async findAllSliders(query: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = query;
    return this.sliderRepository.paginate({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { order: 'asc' },
    });
  }

  async findOneSlider(id: string) {
    const slider = await this.sliderRepository.findOne({ id });
    if (!slider) throw new NotFoundException('Slider not found');
    return slider;
  }

  async createSlider(data: any) {
    const createData: any = {
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      order: Number(data.order) || 0,
      isActive:
        data.isActive !== undefined
          ? String(data.isActive) === 'true' || data.isActive === true
          : true,
    };
    return this.sliderRepository.create(createData);
  }

  async updateSlider(id: string, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
    if (data.order !== undefined) updateData.order = Number(data.order);
    if (data.isActive !== undefined)
      updateData.isActive =
        String(data.isActive) === 'true' || data.isActive === true;

    return this.sliderRepository.update({ id }, updateData);
  }

  async deleteSlider(id: string) {
    return this.sliderRepository.delete({ id });
  }

  async bulkActionSlider(ids: string[], action: string) {
    if (action === 'delete') {
      return this.sliderRepository.model.deleteMany({
        where: { id: { in: ids } },
      });
    }
    const isActive = action === 'activate';
    return this.sliderRepository.model.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
  }

  // Guru Besar
  async findAllGuruBesar(query: PaginationDto) {
    const { page, limit, sortBy, sortOrder } = query;
    return this.guruBesarRepository.paginate({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { order: 'asc' },
    });
  }

  async findOneGuruBesar(id: string) {
    const guru = await this.guruBesarRepository.findOne({ id });
    if (!guru) throw new NotFoundException('Guru Besar not found');
    return guru;
  }

  async createGuruBesar(data: any) {
    const createData: any = {
      name: data.name,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      order: Number(data.order) || 0,
      isActive:
        data.isActive !== undefined
          ? String(data.isActive) === 'true' || data.isActive === true
          : true,
    };
    return this.guruBesarRepository.create(createData);
  }

  async updateGuruBesar(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.order !== undefined) updateData.order = Number(data.order);
    if (data.isActive !== undefined)
      updateData.isActive =
        String(data.isActive) === 'true' || data.isActive === true;

    return this.guruBesarRepository.update({ id }, updateData);
  }

  async deleteGuruBesar(id: string) {
    return this.guruBesarRepository.delete({ id });
  }

  async bulkActionGuruBesar(ids: string[], action: string) {
    if (action === 'delete') {
      return this.guruBesarRepository.model.deleteMany({
        where: { id: { in: ids } },
      });
    }
    const isActive = action === 'activate';
    return this.guruBesarRepository.model.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
  }

  // Publications (Unified News & Articles)
  async findAllPublications(query: any) {
    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      type,
      category,
      isPublished,
    } = query;
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type as PublicationType;
    if (category) where.category = category;

    if (isPublished !== undefined) {
      where.isPublished =
        String(isPublished) === 'true' || isPublished === true;
    }

    return this.publicationRepository.paginate({
      where,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    });
  }

  async findOnePublication(id: string) {
    const pub = await this.publicationRepository.findOne({ id });
    if (!pub) throw new NotFoundException('Publication not found');
    return pub;
  }

  async recordPublicationView(id: string, sessionId?: string) {
    // 1. Increment view count in Publication table
    try {
      await this.publicationRepository.model.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    } catch (e) {
      // Ignore if column doesn't exist in database
    }

    // 2. Create entry in ContentView for analytics
    return this.prisma.contentView.create({
      data: {
        contentId: id,
        contentType: 'PUBLICATION',
        sessionId: sessionId || 'anonymous',
      },
    });
  }

  async createPublication(data: any) {
    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    const isPublished =
      data.isPublished !== undefined
        ? String(data.isPublished) === 'true' || data.isPublished === true
        : data.status === 'published';

    const createData: any = {
      title: data.title,
      slug: slug,
      content: data.content,
      type: data.type || PublicationType.BERITA,
      category: data.category || 'umum',
      imageUrl: data.imageUrl,
      isPublished: isPublished,
      publishedAt: isPublished ? new Date() : null,
    };

    return this.publicationRepository.create(createData);
  }

  async updatePublication(id: string, data: any) {
    const updateData: any = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

    if (data.status !== undefined) {
      updateData.isPublished =
        data.status === 'published' || data.status === 'Terbit';
    } else if (data.isPublished !== undefined) {
      updateData.isPublished =
        String(data.isPublished) === 'true' || data.isPublished === true;
    }

    if (updateData.isPublished !== undefined) {
      updateData.publishedAt = updateData.isPublished ? new Date() : null;
    }

    return this.publicationRepository.update({ id }, updateData);
  }

  async deletePublication(id: string) {
    return this.publicationRepository.delete({ id });
  }

  async bulkActionPublication(ids: string[], action: string) {
    if (action === 'delete') {
      return this.publicationRepository.model.deleteMany({
        where: { id: { in: ids } },
      });
    }

    const isPublished = action === 'publish';
    return this.publicationRepository.model.updateMany({
      where: { id: { in: ids } },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });
  }

  // Gallery
  async findAllGallery(query: PaginationDto) {
    const { page, limit, search, sortBy, sortOrder } = query;
    const where: any = search
      ? { title: { contains: search, mode: 'insensitive' } }
      : {};

    return this.galleryRepository.paginate({
      where,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: 'desc' },
    });
  }

  async findOneGallery(id: string) {
    const gallery = await this.galleryRepository.findOne({ id });
    if (!gallery) throw new NotFoundException('Gallery item not found');
    return gallery;
  }

  async createGallery(data: any) {
    const createData: any = {
      title: data.title,
      imageUrl: data.imageUrl,
      description: data.description,
      category: data.category || 'umum',
      isActive:
        data.isActive !== undefined
          ? String(data.isActive) === 'true' || data.isActive === true
          : true,
    };
    return this.galleryRepository.create(createData);
  }

  async updateGallery(id: string, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isActive !== undefined)
      updateData.isActive =
        String(data.isActive) === 'true' || data.isActive === true;

    return this.galleryRepository.update({ id }, updateData);
  }

  async deleteGallery(id: string) {
    return this.galleryRepository.delete({ id });
  }

  async bulkActionGallery(ids: string[], action: string) {
    if (action === 'delete') {
      return this.galleryRepository.model.deleteMany({
        where: { id: { in: ids } },
      });
    }
    const isActive = action === 'activate';
    return this.galleryRepository.model.updateMany({
      where: { id: { in: ids } },
      data: { isActive },
    });
  }

  async findPublicAll() {
    const [sliders, gurus, publications, gallery] = await Promise.all([
      this.sliderRepository.findAll({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      this.guruBesarRepository.findAll({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      this.publicationRepository.findAll({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.galleryRepository.findAll({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      sliders,
      gurus,
      publications,
      gallery,
    };
  }
}
