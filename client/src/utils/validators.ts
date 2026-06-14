export const isValidEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  return /^[0-9]{9,15}$/.test(phone.replace(/\D/g, ''));
};

export const isValidNik = (nik: string): boolean => {
  return /^[0-9]{16}$/.test(nik);
};
