import { useState, useEffect, useCallback } from 'react';
import { cmsApi } from '@/services/cmsApi';
import { toast } from '@/stores/toastStore';

export const useNews = (filters: any) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cmsApi.getPublications({ ...filters });
      const unwrapped = res.data?.data?.data || res.data?.data || res.data || [];
      setData(Array.isArray(unwrapped) ? unwrapped : []);
    } catch (err: any) {
      toast.error('Gagal mengambil data berita');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};
