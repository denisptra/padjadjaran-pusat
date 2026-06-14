import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SecurityUtils {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const secret = this.configService.get<string>('ENCRYPTION_KEY');
    if (!secret || secret.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 characters long');
    }
    this.key = Buffer.from(secret);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    try {
      if (!encryptedText) return '';
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        return encryptedText;
      }
      const [ivHex, authTagHex, encrypted] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // If the decrypted value still looks encrypted (contains colons), decrypt again
      if (decrypted && decrypted.includes(':')) {
        return this.decrypt(decrypted);
      }
      return decrypted;
    } catch (e) {
      return encryptedText;
    }
  }

  maskPhone(phone: string): string {
    if (!phone) return '';
    const len = phone.length;
    if (len <= 7)
      return (
        phone.substring(0, Math.min(3, len)) + '*'.repeat(Math.max(0, len - 3))
      );
    return (
      phone.substring(0, 3) + '*'.repeat(len - 7) + phone.substring(len - 4)
    );
  }

  maskEmail(email: string): string {
    const [user, domain] = email.split('@');
    if (!domain) return email;
    return `${user[0]}${'*'.repeat(user.length - 1)}@${domain}`;
  }
}
