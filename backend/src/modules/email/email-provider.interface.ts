export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

export interface EmailProvider {
  send(options: EmailOptions): Promise<void>;
}
