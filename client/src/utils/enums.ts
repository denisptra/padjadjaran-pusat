export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISE = 'REVISE',
}

export const ApprovalStatusLabels: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: 'Menunggu',
  [ApprovalStatus.APPROVED]: 'Disetujui',
  [ApprovalStatus.REJECTED]: 'Ditolak',
  [ApprovalStatus.REVISE]: 'Butuh Revisi',
};

export enum PaymentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Menunggu Verifikasi',
  [PaymentStatus.VERIFIED]: 'Terverifikasi',
  [PaymentStatus.REJECTED]: 'Ditolak',
};

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export const ContentStatusLabels: Record<ContentStatus, string> = {
  [ContentStatus.DRAFT]: 'Draft',
  [ContentStatus.PUBLISHED]: 'Published',
};

export enum CompletionStatus {
  BELUM_LENGKAP = 'BELUM_LENGKAP',
  MENUNGGU_VERIFIKASI = 'MENUNGGU_VERIFIKASI',
  LENGKAP = 'LENGKAP',
}

export const CompletionStatusLabels: Record<CompletionStatus, string> = {
  [CompletionStatus.BELUM_LENGKAP]: 'Belum Lengkap',
  [CompletionStatus.MENUNGGU_VERIFIKASI]: 'Menunggu Verifikasi Pusat',
  [CompletionStatus.LENGKAP]: 'Lengkap',
};
