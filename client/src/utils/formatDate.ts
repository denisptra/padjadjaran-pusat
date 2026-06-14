export const formatDate = (date: string | Date | undefined, format: 'short' | 'long' | 'full' = 'long'): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  if (format === 'short') {
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: format === 'full' ? 'long' : 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date: string | Date | undefined): string => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
