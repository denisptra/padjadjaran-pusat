export const maskNik = (nik: string | undefined): string => {
  if (!nik) return 'BELUM DIISI';
  if (nik.length < 14) return nik;
  return nik.substring(0, 6) + 'XXXXXXXX' + nik.substring(14);
};

export const maskPhone = (phone: string | undefined): string => {
  if (!phone) return '-';
  if (phone.length < 8) return phone;
  return phone.substring(0, 4) + 'XXXX' + phone.substring(phone.length - 3);
};

export const maskEmail = (email: string | undefined): string => {
  if (!email) return '-';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  return name.substring(0, 2) + 'XXXXX@' + domain;
};
