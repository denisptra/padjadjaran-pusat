import { Injectable, Logger } from '@nestjs/common';
import { EmailOptions, EmailProvider } from '../email-provider.interface';

@Injectable()
export class EtherealEmailProvider implements EmailProvider {
  private readonly logger = new Logger(EtherealEmailProvider.name);

  async send(options: EmailOptions): Promise<void> {
    this.logger.log(`[ETHEREAL] Email to: ${options.to}`);
    this.logger.log(`[ETHEREAL] Subject: ${options.subject}`);
    this.logger.log(`[ETHEREAL] Body: ${options.template}`);
    // In a real ethereal provider, we might use nodemailer to create a test account
    // and log the preview URL.
  }
}
