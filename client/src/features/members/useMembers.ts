import { useState, useEffect, useCallback } from 'react';
import { memberApi } from '@/services/memberApi';
import { approvalApi } from '@/services/approvalApi';
import { toast } from '@/stores/toastStore';

export const useMembers = (activeTab: 'MANAGEMENT' | 'APPROVAL', filters: any) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (activeTab === 'MANAGEMENT') {
        const apiStatus = filters.status || 'ACTIVE,INACTIVE';
        const res = await memberApi.getAll({ ...filters, status: apiStatus, limit: 100 });
        const unwrapped = res.data?.data?.data || res.data?.data || res.data || [];
        console.log('Member API Response Data:', unwrapped);
        setData(Array.isArray(unwrapped) ? unwrapped : []);
      } else {
        const res = await approvalApi.getAll({ 
          limit: 100,
          search: filters.search, 
          status: 'pending',
          type: 'registration',
          regionId: filters.regionId,
          memberType: filters.memberType
        });
        const unwrapped = res.data?.data?.data || res.data?.data || res.data || [];
        setData(Array.isArray(unwrapped) ? unwrapped : []);
      }
    } catch (err: any) {
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
};
