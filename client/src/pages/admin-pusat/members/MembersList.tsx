import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { 
  Search, Plus, Download, Edit, Eye, User as UserIcon, UserCheck, UserX, Filter, CheckSquare, Square, ShieldCheck, RotateCcw, MapPin, Clock, FileText
} from 'lucide-react';
import { memberApi } from '@/services/memberApi';
import { approvalApi } from '@/services/approvalApi';
import { regionApi } from '@/services/regionApi';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { getSecureFileUrl } from '@/services/api';
import { cn } from '@/utils/cn';
import DataTable from '@/components/ui/DataTable';
import { ActionIconButton } from '@/components/ui/ActionIconButton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useMembers } from '@/features/members/useMembers';

const Members: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const isAdminWilayah = user?.role === 'admin_wilayah';
  const basePath = isAdminWilayah ? '/app/admin-wilayah' : '/app/admin-pusat';

  const [regions, setRegions] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'APPROVAL'>(
    isAdminWilayah ? 'MANAGEMENT' : (searchParams.get('tab') === 'APPROVAL' ? 'APPROVAL' : 'MANAGEMENT')
  );

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '', 
    regionId: searchParams.get('regionId') || '',
    memberType: searchParams.get('memberType') || '',
    gender: searchParams.get('gender') || ''
  });

  const { data, loading, refetch } = useMembers(activeTab, filters);

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    const params: any = { tab: activeTab };
    if (filters.search) params.search = filters.search;
    if (filters.status && activeTab === 'MANAGEMENT') params.status = filters.status;
    if (filters.regionId) params.regionId = filters.regionId;
    if (filters.memberType) params.memberType = filters.memberType;
    if (filters.gender && activeTab === 'MANAGEMENT') params.gender = filters.gender;
    
    setSearchParams(params, { replace: true });
  }, [filters, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchRegions = async () => {
    try {
      const res = await regionApi.getAll({ limit: 100 });
      const unwrapped = res.data?.data?.data || res.data?.data || res.data || [];
      setRegions(unwrapped);
    } catch (err) {
      console.error(err);
    }
  };


  const handleAction = async (id: string, action: string) => {
    try {
      if (action === 'activate') await memberApi.activate(id);
      else if (action === 'deactivate') await memberApi.deactivate(id);
      
      toast.success('Aksi berhasil dilakukan');
      refetch();
    } catch (err) {
      toast.error('Aksi gagal dilakukan');
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate') => {
    if (selectedIds.length === 0) return;
    try {
      setIsBulkProcessing(true);
      await memberApi.bulkAction(selectedIds, action);
      toast.success(`Berhasil ${action === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} ${selectedIds.length} anggota.`);
      setSelectedIds([]);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses aksi massal');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data.map(m => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      status: '',
      regionId: '',
      memberType: '',
      gender: ''
    });
  };

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<any>(null);


  const exportToCSV = () => {
    if (data.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const headers = ['Nama Lengkap', 'Email', 'No. KTA', 'Wilayah', 'Jenis Kelamin', 'Tipe Anggota', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.map(m => [
        `"${m.fullName}"`,
        `"${m.user?.email}"`,
        `"${m.ktaNumber || '-'}"`,
        `"${m.region?.name || '-'}"`,
        `"${m.gender || '-'}"`,
        `"${m.memberType}"`,
        `"${m.user?.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data_anggota_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data berhasil diekspor ke CSV');
  };

  const managementColumns = [
    ...(isSelectionMode && !isAdminWilayah ? [{
      key: 'select',
      label: (
        <button 
          onClick={() => handleSelectAll(selectedIds.length !== data.length)}
          className="p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer"
        >
          {selectedIds.length === data.length && data.length > 0 ? (
            <CheckSquare size={16} className="text-[#DCAF01]" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      ),
      render: (_: any, row: any) => (
        <button 
          onClick={(e) => { e.stopPropagation(); toggleSelect(row.id); }}
          className="p-1 hover:bg-gray-100 rounded transition-colors bg-transparent border-0 cursor-pointer"
        >
          {selectedIds.includes(row.id) ? (
            <CheckSquare size={16} className="text-[#DCAF01]" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      ),
      className: 'w-10'
    }] : []),
    { 
      key: 'fullName', 
      label: 'Anggota',
      render: (val: string, row: any) => (
        <div className="flex items-center gap-3 text-left min-w-[180px]">
          <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
            {row.photoUrl ? <img src={getSecureFileUrl(row.photoUrl) || row.photoUrl} alt="" className="h-full w-full object-cover" /> : <UserIcon size={20} className="text-gray-400" />}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-[13px] font-bold text-gray-900 truncate uppercase">{val || 'Tanpa Nama'}</p>
            <p className="text-[11px] text-gray-400 truncate font-mono uppercase tracking-tighter">{row.ktaNumber || 'BELUM TERBIT'}</p>
          </div>
        </div>
      )
    },
    { 
        key: 'contact', 
        label: 'Kontak', 
        render: (_: any, row: any) => (
            <div className="text-left leading-tight min-w-[140px]">
                <p className="text-[11px] font-semibold text-gray-700 truncate max-w-[150px]">{row.user?.email}</p>
                <p className="text-[11px] font-bold text-[#DCAF01] mt-0.5">{row.phone || '-'}</p>
            </div>
        )
    },
    { 
        key: 'gender', 
        label: 'L/P', 
        align: 'center' as const,
        render: (val: string) => (
            <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md uppercase",
                val === 'Laki-laki' ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"
            )}>
                {val === 'Laki-laki' ? 'L' : val === 'Perempuan' ? 'P' : '-'}
            </span>
        )
    },
    ...(!isAdminWilayah ? [{ 
      key: 'region', 
      label: 'Wilayah', 
      render: (val: any) => <span className="text-[12px] font-semibold text-gray-600 tracking-tight">{val?.name || '-'}</span> 
    }] : []),
    { 
        key: 'memberType', 
        label: 'Tipe', 
        render: (val: string) => {
            const type = val?.toLowerCase() || '';
            let variant: any = 'gray';
            let customClass = '';
            
            if (type === 'khusus') {
                customClass = 'bg-amber-100 text-amber-700 border-amber-200';
            } else if (type === 'pencak_silat') {
                customClass = 'bg-red-100 text-red-700 border-red-200';
            } else {
                customClass = 'bg-gray-100 text-gray-700 border-gray-200';
            }
            
            return <Badge variant={variant} className={cn("uppercase text-[9px] border font-bold", customClass)}>{val?.replace('_', ' ')}</Badge>
        }
    },
    { key: 'status', label: 'Status', render: (_: any, row: any) => {
        const status = row.user?.status;
        return <Badge variant={status === 'ACTIVE' ? 'success' : status === 'PENDING' ? 'warning' : 'danger'}>
            {status === 'ACTIVE' ? 'Aktif' : status === 'PENDING' ? 'Menunggu' : 'Non-aktif'}
        </Badge>
    }},
    { 
      key: 'actions', 
      label: 'Aksi',
      align: 'right' as const,
      render: (_: any, row: any) => {
        const isActive = row.user?.status === 'ACTIVE';
        return (
          <div className="flex justify-end gap-1">
            <ActionIconButton icon={Eye} label="Detail" variant="primary" onClick={() => navigate(`${basePath}/members/${row.id}`)} />
            {!isAdminWilayah && (
              <ActionIconButton icon={Edit} label="Edit" variant="primary" onClick={() => navigate(`${basePath}/members/${row.id}/edit`)} />
            )}
            {isActive ? (
              <ActionIconButton 
                icon={UserX} 
                label="Nonaktifkan" 
                variant="danger" 
                onClick={() => setConfirmAction({ id: row.id, action: 'deactivate', name: row.fullName })} 
              />
            ) : (
              <ActionIconButton 
                icon={UserCheck} 
                label="Aktifkan" 
                variant="success" 
                onClick={() => setConfirmAction({ id: row.id, action: 'activate', name: row.fullName })} 
              />
            )}
          </div>
        );
      }
    }
  ];

  const approvalColumns = [
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
          onClick={() => navigate(`${basePath}/approvals/${row.id}`)}
          icon={<Eye size={14} />}
        >
          Tinjau Data
        </Button>
      )
    }
  ];

  const columns = activeTab === 'MANAGEMENT' ? managementColumns : approvalColumns;

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <PageHeader 
        title={isAdminWilayah ? "Daftar Anggota Wilayah" : (activeTab === 'MANAGEMENT' ? "Manajemen Anggota" : "Antrean Persetujuan")} 
        subtitle={isAdminWilayah ? "Lihat dan pantau data anggota di wilayah Anda." : (activeTab === 'MANAGEMENT' ? "Kelola dan pantau seluruh basis data anggota PPS Padjadjaran." : "Verifikasi pendaftaran anggota baru dan bukti pembayaran manual via WhatsApp.")}
        action={
          activeTab === 'MANAGEMENT' && !isAdminWilayah && (
            <div className="flex gap-2">
               <Button variant="white" icon={<Download size={16} />} onClick={exportToCSV}>Ekspor</Button>
               <Button icon={<Plus size={16} />} onClick={() => navigate(`${basePath}/members/add`)}>Tambah anggota</Button>
            </div>
          )
        }
      />

      {/* Tabs Interface */}
      {!isAdminWilayah && (
        <div className="flex border-b border-gray-100 bg-white rounded-t-2xl px-2">
          <button
            onClick={() => setActiveTab('MANAGEMENT')}
            className={cn(
              "px-6 py-4 text-[13px] font-medium transition-all border-b-2 relative top-[1px]",
              activeTab === 'MANAGEMENT' 
                ? "border-[#DCAF01] text-[#DCAF01]" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Manajemen Anggota
          </button>
          <button
            onClick={() => setActiveTab('APPROVAL')}
            className={cn(
              "px-6 py-4 text-[13px] font-medium transition-all border-b-2 relative top-[1px]",
              activeTab === 'APPROVAL' 
                ? "border-[#DCAF01] text-[#DCAF01]" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            )}
          >
            Antrean Persetujuan
          </button>
        </div>
      )}

      {/* Advanced Filter Panel - Top position */}
      <Card className={cn(!isAdminWilayah && "rounded-t-none border-t-0")}>
        <div className="space-y-6">
           <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center gap-2">
                 <Filter size={18} className="text-[#DCAF01]" />
                 <h3 className="text-[14px] font-bold text-gray-900">
                    {activeTab === 'MANAGEMENT' ? 'Filter pencarian anggota' : 'Filter antrean pendaftaran'}
                 </h3>
              </div>
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-[#DCAF01] transition-all bg-transparent border-0 cursor-pointer"
              >
                <RotateCcw size={14} /> Reset Filter
              </button>
           </div>

           <div className={cn(
             "grid grid-cols-1 sm:grid-cols-2 gap-4",
             activeTab === 'MANAGEMENT' 
               ? (isAdminWilayah ? "lg:grid-cols-4" : "lg:grid-cols-4 xl:grid-cols-5")
               : "lg:grid-cols-3"
           )}>
              <Input 
                label={activeTab === 'MANAGEMENT' ? "Nama / ID / Email" : "Nama / Email"}
                placeholder={activeTab === 'MANAGEMENT' ? "Cari kata kunci..." : "Cari calon anggota..."}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                icon={<Search size={14} />}
              />

              {activeTab === 'MANAGEMENT' && (
                <Select 
                  label="Status Akun"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  options={[
                    { label: 'Semua Status', value: '' },
                    { label: 'Aktif', value: 'ACTIVE' },
                    { label: 'Non-aktif', value: 'INACTIVE' }
                  ]}
                />
              )}

              <Select 
                label="Jenis Keanggotaan"
                value={filters.memberType}
                onChange={(e) => setFilters({...filters, memberType: e.target.value})}
                options={[
                  { label: 'Semua Tipe', value: '' },
                  { label: 'Umum', value: 'umum' },
                  { label: 'Khusus', value: 'khusus' },
                  { label: 'Pencak Silat', value: 'pencak_silat' }
                ]}
              />

              {activeTab === 'MANAGEMENT' && (
                <Select 
                  label="Jenis Kelamin"
                  value={filters.gender}
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                  options={[
                    { label: 'Semua Gender', value: '' },
                    { label: 'Laki-laki', value: 'Laki-laki' },
                    { label: 'Perempuan', value: 'Perempuan' }
                  ]}
                />
              )}

              {!isAdminWilayah && (
                <Select 
                  label={activeTab === 'MANAGEMENT' ? "Wilayah Penempatan" : "Wilayah Cabang"}
                  value={filters.regionId}
                  onChange={(e) => setFilters({...filters, regionId: e.target.value})}
                  options={[
                    { label: 'Semua Wilayah', value: '' },
                    ...regions.map(r => ({ label: r.name, value: r.id }))
                  ]}
                />
              )}
           </div>
        </div>
      </Card>

      {/* Bulk Action Bar - Only for Management */}
      {activeTab === 'MANAGEMENT' && selectedIds.length > 0 && (
         <div className="sticky top-20 z-30 p-4 bg-gray-900 border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-full bg-[#DCAF01] flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#DCAF01]/20">
                  <ShieldCheck size={20} />
               </div>
               <div>
                  <p className="text-[13px] font-bold text-white leading-none mb-1">{selectedIds.length} anggota terpilih</p>
                  <p className="text-[11px] text-gray-400 font-normal">Pilih aksi massal yang ingin diterapkan.</p>
               </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 font-bold" 
                 onClick={() => handleBulkAction('activate')}
                 isLoading={isBulkProcessing}
                 icon={<UserCheck size={14} />}
               >
                 Aktifkan Semua
               </Button>
               <Button 
                 variant="white" 
                 size="sm" 
                 className="flex-1 sm:flex-none border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold" 
                 onClick={() => handleBulkAction('deactivate')}
                 isLoading={isBulkProcessing}
                 icon={<UserX size={14} />}
               >
                 Non-aktifkan Semua
               </Button>
               <button 
                 onClick={() => setSelectedIds([])} 
                 className="px-4 py-2 text-[11px] font-bold text-gray-400 hover:text-white transition-all bg-transparent border-0 cursor-pointer"
               >
                 Batalkan
               </button>
            </div>
         </div>
      )}

      {/* Utility Bar above Table */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-4">
           <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              Total {data.length} Anggota
           </h3>
           {activeTab === 'MANAGEMENT' && !isAdminWilayah && (
             <>
               <div className="w-px h-3 bg-gray-200" />
               <button 
                 onClick={() => setIsSelectionMode(!isSelectionMode)}
                 className={cn(
                   "flex items-center gap-1.5 text-[11px] font-bold transition-all bg-transparent border-0 cursor-pointer outline-none",
                   isSelectionMode ? "text-[#DCAF01]" : "text-gray-400 hover:text-gray-600"
                 )}
               >
                 <CheckSquare size={14} /> {isSelectionMode ? 'Tutup Pemilihan' : 'Pilih Banyak'}
               </button>
             </>
           )}
        </div>
      </div>

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

      <ConfirmModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { toast.info('Penghapusan data permanen dibatasi untuk integritas database.'); setConfirmDelete(null); }}
        title="Hapus data anggota?"
        message={`Apakah Anda yakin ingin menghapus "${confirmDelete?.fullName}"? Seluruh riwayat dan ID anggota akan dinonaktifkan secara permanen.`}
        variant="danger"
      />

      <ConfirmModal 
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!confirmAction) return;
          const { id, action } = confirmAction;
          setConfirmAction(null);
          await handleAction(id, action);
        }}
        title={confirmAction?.action === 'activate' ? "Aktifkan Anggota?" : "Nonaktifkan Anggota?"}
        message={
          confirmAction?.action === 'activate' 
            ? `Apakah Anda yakin ingin mengaktifkan "${confirmAction?.name}"? Anggota ini akan dapat mengakses dashboard dan fitur aplikasi.`
            : `Apakah Anda yakin ingin menonaktifkan "${confirmAction?.name}"? Anggota ini tidak akan bisa login ke dalam aplikasi.`
        }
        variant={confirmAction?.action === 'activate' ? 'primary' : 'danger'}
      />
    </div>
  );
};

export default Members;
