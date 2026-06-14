import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './core/prisma/prisma.service';
import { Public } from './core/decorators/public.decorator';
import { EmailService } from './modules/email/email.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-error')
  @Public()
  async testError() {
    try {
      const users = await this.prisma.user.findMany({
        include: { profile: true },
      });

      const approvals = await this.prisma.approval.findMany();
      return { success: true, users, approvals };
    } catch (e: any) {
      return { success: false, error: e.message, stack: e.stack };
    }
  }
}




