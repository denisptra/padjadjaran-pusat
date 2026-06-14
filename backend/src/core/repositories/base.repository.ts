import { PrismaService } from '../prisma/prisma.service';

export abstract class BaseRepository<T, CreateDto = any, UpdateDto = any> {
  constructor(protected readonly prisma: PrismaService) {}

  abstract get model(): any;

  protected getModel(tx?: any) {
    return tx ? tx[this.modelName] : this.model;
  }

  protected get modelName(): string {
    return (
      this.model.name ||
      this.constructor.name.replace('Repository', '').charAt(0).toLowerCase() +
        this.constructor.name.replace('Repository', '').slice(1)
    );
  }

  async findAll(
    params: {
      skip?: number;
      take?: number;
      cursor?: any;
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
    },
    tx?: any,
  ): Promise<T[]> {
    return this.getModel(tx).findMany(params);
  }

  async findOne(
    where: any,
    include?: any,
    select?: any,
    tx?: any,
  ): Promise<T | null> {
    return this.getModel(tx).findUnique({
      where,
      include,
      select,
    });
  }

  async create(data: CreateDto, tx?: any): Promise<T> {
    return this.getModel(tx).create({
      data,
    });
  }

  async update(where: any, data: UpdateDto, tx?: any): Promise<T> {
    return this.getModel(tx).update({
      where,
      data,
    });
  }

  async delete(where: any, tx?: any): Promise<T> {
    return this.getModel(tx).delete({
      where,
    });
  }

  async count(where?: any, tx?: any): Promise<number> {
    return this.getModel(tx).count({ where });
  }

  async paginate(
    params: {
      page?: number;
      limit?: number;
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
    },
    tx?: any,
  ) {
    const page = params.page || 1;
    const limit = params.limit || 1000; // Increased to 1000 for frontend client-side pagination
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.findAll(
        {
          where: params.where,
          skip,
          take: limit,
          orderBy: params.orderBy,
          include: params.include,
          select: params.select,
        },
        tx,
      ),
      this.count(params.where, tx),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
