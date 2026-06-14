import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailOptions, EmailProvider } from '../email-provider.interface';

@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SmtpEmailProvider.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<boolean>('SMTP_SECURE') || false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async send(options: EmailOptions): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM');
    const html = options.template; // In a real app, this would be rendered from a template file

    try {
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html,
      });
      this.logger.log(`Email sent to ${options.to} via SMTP`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to} via SMTP`,
        error.stack,
      );
      throw error;
    }
  }
}
