import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { 
  Search, 
  Loader2, 
  Eye,
  User as UserIcon,
  MapPin,
  Clock,
  Filter,
  RotateCcw
} from 'lucide-react';
import { approvalApi } from '../../../services/approvalApi';
import { regionApi } from '../../../services/regionApi';
import { toast } from '../../../stores/toastStore';
import { getSecureFileUrl } from '../../../services/api';
import DataTable from '../../../components/ui/DataTable';

const Approvals: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    regionId: searchParams.get('regionId') || '',
    memberType: searchParams.get('memberType') || '',
  });

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    // Sync filters to URL
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.regionId) params.regionId = filters.regionId;
    if (filters.memberType) params.memberType = filters.memberType;
    setSearchParams(params, { replace: true });

    fetchData();
  }, [filters]);

  const fetchRegions = async () => {
    try {
      const res = await regionApi.getAll({ limit: 100 });
      const unwrapped = res.data?.data?.data || res.data?.data || res.data || [];
      setRegions(unwrapped);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
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
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Gagal memuat data antrean: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      regionId: '',
      memberType: ''
    });
  };

  const columns = [
    { 
      key: 'creator', 
      label: 'Calon Anggota',
      render: (val: any) => (
        <div className="flex items-center gap-3 text-left">
          <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100 shrink-0">
            {val?.profile?.photoUrl ? <img src={getSecureFileUrl(val.profile.photoUrl) || val.profile.photoUrl} className="h-full w-full object-cover" alt="" /> : <UserIcon size={18} />}
          </div>
          <div className="leading-tight">
             <p className="text-[13px] font-bold text-gray-900">{val?.profile?.fullName || val?.email}</p>
             <p className="text-[11px] text-gray-400 font-normal">{val?.email}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'region', 
      label: 'Wilayah Cabang', 
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1.5 text-gray-500 text-left">
           <MapPin size={12} />
           <span className="text-[12px] font-semibold text-gray-600 tracking-tight">{row.creator?.profile?.region?.name || '-'}</span>
        </div>
      )
    },
    { 
      key: 'memberType', 
      label: 'Jenis Anggota', 
      render: (_: any, row: any) => (
        <Badge variant="gray" className="uppercase text-[9px]">{row.creator?.profile?.memberType?.replace('_', ' ') || '-'}</Badge>
      )
    },
    { 
      key: 'payment', 
      label: 'Manual Verif',
      render: () => (
        <Badge variant="info" className="text-[9px] uppercase tracking-wider">Via WhatsApp</Badge>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Tanggal Daftar',
      render: (val: string) => (
        <div className="flex items-center gap-1.5 text-gray-400 text-left">
           <Clock size={12} />
           <span className="text-[11px] font-medium">{new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      )
    },
    { 
      key: 'actions', 
      label: 'Opsi',
      align: 'right' as const,
      render: (_: any, row: any) => (
        <Button 
          size="xs" 
          variant="primary" 
          className="h-8 px-4 font-bold text-[11px] shadow-sm"
          onClick={() => navigate(`/app/admin-pusat/approvals/${row.id}`)}
          icon={<Eye size={14} />}
        >
          Tinjau Data
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <PageHeader 
        title="Antrean Persetujuan" 
        subtitle="Verifikasi pendaftaran anggota baru dan bukti pembayaran manual via WhatsApp."
      />

      {/* Advanced Filter Panel */}
      <Card>
        <div className="space-y-6">
           <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                 <Filter size={18} className="text-[#DCAF01]" />
                 <h3 className="text-[14px] font-bold text-gray-900">Filter antrean pendaftaran</h3>
              </div>
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-[#DCAF01] transition-all bg-transparent border-0 cursor-pointer"
              >
                <RotateCcw size={14} /> Reset Filter
              </button>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input 
                label="Nama / Email"
                placeholder="Cari calon anggota..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                icon={<Search size={14} />}
              />

              <Select 
                label="Tipe Keanggotaan"
                value={filters.memberType}
                onChange={(e) => setFilters({...filters, memberType: e.target.value})}
                options={[
                  { label: 'Semua Tipe', value: '' },
                  { label: 'Umum', value: 'umum' },
                  { label: 'Khusus', value: 'khusus' },
                  { label: 'Pencak Silat', value: 'pencak_silat' }
                ]}
              />

              <Select 
                label="Wilayah Cabang"
                value={filters.regionId}
                onChange={(e) => setFilters({...filters, regionId: e.target.value})}
                options={[
                  { label: 'Semua Wilayah', value: '' },
                  ...regions.map(r => ({ label: r.name, value: r.id }))
                ]}
              />
           </div>
        </div>
      </Card>

      <Card noPadding>
        <div className="overflow-x-auto min-h-[400px]">
          <DataTable 
            columns={columns} 
            data={data} 
            isLoading={loading}
            className="border-0 rounded-none text-left" 
            clientPagination={true}
            rowsPerPage={10}
          />
        </div>
      </Card>
    </div>
  );
};

export default Approvals;
