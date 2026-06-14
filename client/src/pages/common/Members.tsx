import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ConfirmationModal from '../../components/ui/ConfirmModal';
import { 
  Search, 
  Filter, 
  Eye,
  User as UserIcon,
  Plus,
  Edit,
  Loader2,
  UserCheck,
  UserX
} from 'lucide-react';
import { memberApi } from '../../services/memberApi';
import { regionApi } from '../../services/regionApi';
import { toast } from '../../stores/toastStore';
import { useAuthStore } from '../../features/auth/stores/auth.store';

const MembersPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, user } = useAuthStore();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterType, setFilterType] = useState('Semua Kategori');
  const [filterRegion, setFilterRegion] = useState('Semua Wilayah');
  const [filterGender, setFilterGender] = useState('Semua Jenis Kelamin');
  
  const isNationalAdmin = role === 'admin_pusat' || role === 'super_admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, regionsRes] = await Promise.all([
        isNationalAdmin ? memberApi.getAll() : regionApi.getMembers(),
        isNationalAdmin ? regionApi.getAll() : Promise.resolve({ data: [] })
      ]);
      setUsersList(membersRes.data.data || []);
      if (isNationalAdmin) {
        setRegions(regionsRes.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data anggota.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('Semua Status');
    setFilterType('Semua Kategori');
    setFilterRegion('Semua Wilayah');
    setFilterGender('Semua Jenis Kelamin');
    fetchData();
  };

  // Filter logic
  const filteredData = usersList.filter(u => {
    const fullName = u.fullName || '';
    const email = u.user?.email || u.email || '';
    const ktaNumber = u.ktaNumber || '';
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ktaNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = u.user?.status || u.status;
    const matchesStatus = filterStatus === 'Semua Status' || 
                         (filterStatus === 'Aktif' && status === 'active') ||
                         (filterStatus === 'Tertunda' && status === 'pending') ||
                         (filterStatus === 'Nonaktif' && status === 'inactive');

    const matchesType = filterType === 'Semua Kategori' || u.memberType === filterType;
    
    // For national admin, check region filter. For region admin, they only see their own anyway.
    const matchesRegion = !isNationalAdmin || filterRegion === 'Semua Wilayah' || u.region?.name === filterRegion || u.wilayahName === filterRegion;

    const matchesGender = filterGender === 'Semua Jenis Kelamin' || u.gender === filterGender;

    return matchesSearch && matchesStatus && matchesType && matchesRegion && matchesGender;
  });

  const handleMasterCheckbox = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredData.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    try {
      setLoading(true);
      await memberApi.bulkAction(selectedIds, action);
      toast.success(`Aksi massal (${action}) berhasil dilakukan pada ${selectedIds.length} anggota.`);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      toast.error('Gagal melakukan aksi massal.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'select',
      label: (
        <input 
          type="checkbox"
          checked={selectedIds.length === filteredData.length && filteredData.length > 0}
          onChange={(e) => handleMasterCheckbox(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-[#DCAF01] focus:ring-[#DCAF01]/20 cursor-pointer"
        />
      ),
      render: (_: any, row: any) => (
        <input 
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds(prev => [...prev, row.id]);
            } else {
              setSelectedIds(prev => prev.filter(id => id !== row.id));
            }
          }}
          className="h-4 w-4 rounded border-gray-300 text-[#DCAF01] focus:ring-[#DCAF01]/20 cursor-pointer"
        />
      ),
      align: 'center' as const,
      className: 'w-12 px-2'
    },
    {
      key: 'avatar',
      label: 'Foto',
      render: (_: any, row: any) => (
        <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
          {row.user?.avatarUrl ? <img src={row.user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" /> : <UserIcon size={14} className="text-gray-400" />}
        </div>
      )
    },
    { 
      key: 'fullName', 
      label: 'Nama Lengkap',
      render: (val: string, row: any) => (
        <div className="flex flex-col text-left">
           <span className="font-semibold text-gray-900 uppercase text-[12.5px]">{val}</span>
           <span className="text-[11px] text-gray-400 font-medium">{row.user?.email || '-'}</span>
        </div>
      )
    },
    { key: 'ktaNumber', label: 'No. E-KTA' },
    { key: 'memberType', label: 'Kategori' },
    { 
      key: 'region', 
      label: 'Wilayah',
      render: (val: any, row: any) => row.region?.name || row.wilayahName || 'Pusat'
    },
    {
      key: 'status',
      label: 'Akses',
      render: (_: any, row: any) => {
        const val = row.user?.status || row.status;
        return (
          <Badge variant={val === 'active' ? 'success' : val === 'pending' ? 'warning' : 'gray'}>
            {val === 'active' ? 'Aktif' : val === 'pending' ? 'Tertunda' : 'Nonaktif'}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
           <button 
             onClick={() => navigate(`/app/${isNationalAdmin ? 'admin-pusat' : 'admin-wilayah'}/members/${row.id}`)}
             className="p-2 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 transition-all border-0 bg-transparent cursor-pointer"
             title="Lihat Detail"
           >
              <Eye size={16} />
           </button>
           {isNationalAdmin && (
             <>
               <button 
                 onClick={() => navigate(`/app/admin-pusat/members/${row.id}/edit`)}
                 className="p-2 hover:bg-blue-50 rounded text-blue-500 transition-all border-0 bg-transparent cursor-pointer"
                 title="Edit Member"
               >
                  <Edit size={16} />
               </button>
               {row.status === 'ACTIVE' ? (
                 <button 
                   onClick={() => handleStatusChange(row.id, 'deactivate', row.fullName)}
                   className="p-2 hover:bg-red-50 rounded text-red-500 transition-all border-0 bg-transparent cursor-pointer"
                   title="Non-aktifkan Member"
                 >
                    <UserX size={16} />
                 </button>
               ) : (
                 <button 
                   onClick={() => handleStatusChange(row.id, 'activate', row.fullName)}
                   className="p-2 hover:bg-emerald-50 rounded text-emerald-500 transition-all border-0 bg-transparent cursor-pointer"
                   title="Aktifkan Member"
                 >
                    <UserCheck size={16} />
                 </button>
               )}
             </>
           )}
        </div>
      )
    }
  ];

  const handleStatusChange = async (id: string, action: 'activate' | 'deactivate', name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${action === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} akses anggota ${name}?`)) return;
    try {
      setLoading(true);
      if (action === 'activate') {
        await memberApi.activate(id);
        toast.success(`Berhasil mengaktifkan akses untuk ${name}.`);
      } else {
        await memberApi.deactivate(id);
        toast.success(`Berhasil menonaktifkan akses untuk ${name}.`);
      }
      fetchData();
    } catch (err: any) {
      toast.error(`Gagal ${action === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} anggota: ${err.response?.data?.message || err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title={isNationalAdmin ? "Manajemen Anggota Nasional" : "Anggota Wilayah"} 
        subtitle={isNationalAdmin ? "Pantau dan kelola seluruh anggota PPS Padjadjaran di seluruh wilayah." : `Daftar seluruh anggota yang terdaftar di ${(user as any)?.wilayahName || 'Wilayah Anda'}.`}
        action={
          isNationalAdmin && (
            <Button size="sm" onClick={() => toast.info('Gunakan fitur registrasi publik untuk menambah anggota.')}>
              <Plus size={16} className="mr-2" /> Tambah Anggota
            </Button>
          )
        }
      />

      {/* Filter & Search Bar */}
      <Card noPadding>
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-b border-gray-100">
           <div className={isNationalAdmin ? "md:col-span-3 space-y-1.5" : "md:col-span-4 space-y-1.5"}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Pencarian Anggota</label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#DCAF01] transition-colors" size={16} />
                <input 
                  type="text"
                  placeholder="Cari nama, email, atau KTA..."
                  className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#DCAF01] focus:bg-white focus:ring-4 focus:ring-[#DCAF01]/5 transition-all font-medium font-inter shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
           </div>

           <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Status Akses</label>
              <Select 
                options={[
                  { label: 'Semua Status', value: 'Semua Status' },
                  { label: 'Aktif', value: 'Aktif' },
                  { label: 'Tertunda', value: 'Tertunda' },
                  { label: 'Nonaktif', value: 'Nonaktif' }
                ]} 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-11 text-[13px] font-medium"
              />
           </div>

           <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Kategori</label>
              <Select 
                options={[
                  { label: 'Semua Kategori', value: 'Semua Kategori' },
                  { label: 'Umum', value: 'Umum' },
                  { label: 'Khusus', value: 'Khusus' },
                  { label: 'Pencak Silat', value: 'Pencak Silat' }
                ]} 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-11 text-[13px] font-medium"
              />
           </div>

           <div className="md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Jenis Kelamin</label>
              <Select 
                options={[
                  { label: 'Semua Gender', value: 'Semua Jenis Kelamin' },
                  { label: 'Laki-laki', value: 'Laki-laki' },
                  { label: 'Perempuan', value: 'Perempuan' }
                ]} 
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="h-11 text-[13px] font-medium"
              />
           </div>

           {isNationalAdmin ? (
             <div className="md:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Filter Wilayah</label>
                <Select 
                  options={[
                    { label: 'Semua Wilayah', value: 'Semua Wilayah' },
                    ...regions.map(r => ({ label: r.name, value: r.name }))
                  ]} 
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="h-11 text-[13px] font-medium"
                />
             </div>
           ) : null}

           <div className={isNationalAdmin ? "md:col-span-1" : "md:col-span-2"}>
              <Button variant="outline" className="w-full h-11 text-[13px] border-gray-200 font-semibold text-gray-600" onClick={handleReset}>
                 Reset
              </Button>
           </div>
        </div>
      </Card>

      {/* Bulk Action Toolbar */}
      {selectedIds.length > 0 && isNationalAdmin && (
         <div className="p-4 bg-[#DCAF01]/10 border border-[#DCAF01]/30 rounded-lg flex flex-col xl:flex-row items-center justify-between gap-4 animate-fade text-left shadow-sm">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-[#DCAF01] flex items-center justify-center text-white shrink-0">
                  <Plus size={20} className="rotate-45" />
               </div>
               <div>
                  <p className="text-[13px] font-semibold text-gray-900 leading-none mb-1">{selectedIds.length} Anggota Terpilih</p>
                  <p className="text-[11px] text-gray-500 font-medium">Lakukan aksi massal untuk anggota yang dipilih.</p>
               </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
               <Button 
                 variant="white" 
                 size="sm"
                 className="text-[11px] font-semibold border-emerald-200 text-emerald-600 hover:bg-emerald-50 h-9 px-3"
                 onClick={() => handleBulkAction('activate')}
               >
                  Aktifkan Semua
               </Button>
               <Button 
                 variant="white" 
                 size="sm"
                 className="text-[11px] font-semibold border-amber-200 text-amber-600 hover:bg-amber-50 h-9 px-3"
                 onClick={() => handleBulkAction('deactivate')}
               >
                  Nonaktifkan Semua
               </Button>
               <Button 
                 variant="white" 
                 size="sm"
                 className="text-[11px] font-semibold border-red-200 text-red-600 hover:bg-red-50 h-9 px-3"
                 onClick={() => {
                   if(window.confirm('Yakin ingin menghapus semua anggota terpilih?')) handleBulkAction('delete');
                 }}
               >
                  Hapus Semua
               </Button>
               <Button 
                 variant="white" 
                 size="sm"
                 className="text-[11px] font-semibold border-gray-200 text-gray-400 h-9 px-3"
                 onClick={() => setSelectedIds([])}
               >
                  Batal
               </Button>
            </div>
         </div>
      )}

      {/* Table Section */}
      <Card noPadding title="Database Anggota" subtitle={`Menampilkan ${filteredData.length} data yang sesuai dengan kriteria filter.`}>
         {loading ? (
            <div className="py-32 flex flex-col items-center justify-center text-gray-400 gap-4">
               <Loader2 size={32} className="animate-spin opacity-40" />
               <p className="text-[13px] font-medium animate-pulse">Sinkronisasi data...</p>
            </div>
         ) : (
            <DataTable 
              columns={columns} 
              data={filteredData} 
              className="border-0 rounded-none"
            />
         )}
      </Card>
    </div>
  );
};

export default MembersPage;
