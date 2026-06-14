import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './email-provider.interface';
import { SmtpEmailProvider } from './providers/smtp-email.provider';
import { EtherealEmailProvider } from './providers/ethereal-email.provider';
import {
  registerOtpTemplate,
  resetPasswordTemplate,
  changeEmailOtpTemplate,
} from './templates/auth.templates';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private provider: EmailProvider;

  constructor(private configService: ConfigService) {
    const providerType =
      this.configService.get<string>('MAIL_PROVIDER') || 'ethereal';

    if (providerType === 'brevo' || providerType === 'smtp') {
      this.provider = new SmtpEmailProvider(this.configService);
    } else {
      this.provider = new EtherealEmailProvider();
    }

    this.logger.log(`Using email provider: ${providerType}`);
  }

  async sendOtp(email: string, otp: string): Promise<void> {
    setImmediate(() => {
      this.provider.send({
        to: email,
        subject: 'PPS Padjadjaran - Kode Verifikasi OTP',
        template: registerOtpTemplate(otp),
        context: { otp },
      }).catch(err => {
        this.logger.error(`Failed to send OTP email to ${email}: ${err.message}`, err.stack);
      });
    });
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    const resetLink = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    setImmediate(() => {
      this.provider.send({
        to: email,
        subject: 'PPS Padjadjaran - Reset Kata Sandi',
        template: resetPasswordTemplate(resetLink),
        context: { resetLink },
      }).catch(err => {
        this.logger.error(`Failed to send password reset email to ${email}: ${err.message}`, err.stack);
      });
    });
  }

  async sendEmailChangeOtp(email: string, otp: string): Promise<void> {
    setImmediate(() => {
      this.provider.send({
        to: email,
        subject: 'PPS Padjadjaran - Verifikasi Email Baru',
        template: changeEmailOtpTemplate(otp),
        context: { otp },
      }).catch(err => {
        this.logger.error(`Failed to send email change OTP to ${email}: ${err.message}`, err.stack);
      });
    });
  }
}
