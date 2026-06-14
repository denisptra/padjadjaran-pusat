import React, { useEffect, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  ShieldX,
  UserX,
  UserCheck,
  MoreVertical,
  Plus,
  Shield,
  Clock,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { toast } from '../../../stores/toastStore';
import ConfirmationModal from '../../../components/ui/ConfirmModal';
import Modal from '../../../components/ui/Modal';
import { superAdminApi } from '../../../services/superAdminApi';

const UserManagementPage: React.FC = () => {
  const { startImpersonate: setImpersonateInStore } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Semua Role');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ type: string; user: any } | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getUsers({
        search: searchTerm,
        role: filterRole,
      });
      setUsersList(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type: string, user: any) => {
    setConfirmAction({ type, user });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    
    try {
       if (type === 'impersonate') {
          const res = await superAdminApi.startImpersonate(user.id);
          localStorage.setItem('accessToken', res.data.accessToken);
          setImpersonateInStore(user);
          toast.success(`Berhasil login sebagai ${user.fullName}`);
          window.location.href = '/app';
       } else if (type === 'deactivate') {
          await superAdminApi.deactivateUser(user.id);
          toast.success(`Akun ${user.fullName} telah dinonaktifkan.`);
          fetchUsers();
       } else if (type === 'activate') {
          await superAdminApi.activateUser(user.id);
          toast.success(`Akun ${user.fullName} telah diaktifkan kembali.`);
          fetchUsers();
       }
       setConfirmAction(null);
    } catch (err) {
       toast.error('Gagal memproses permintaan.');
    }
  };

  const columns = [
    { 
      key: 'avatar', 
      label: 'User',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <UserIcon size={14} />
           </div>
           <div className="text-left">
              <p className="text-[13px] font-semibold text-gray-900 leading-none mb-1 uppercase">{row.fullName}</p>
              <p className="text-[11px] text-gray-400 font-medium leading-none">{row.email}</p>
           </div>
        </div>
      )
    },
    { 
      key: 'role', 
      label: 'Role',
      render: (val: string) => (
        <Badge variant={val === 'super_admin' ? 'danger' : val === 'admin_pusat' ? 'warning' : 'info'} className="capitalize">
          {val?.replace('_', ' ')}
        </Badge>
      )
    },
    { key: 'wilayahName', label: 'Wilayah' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val: string) => (
        <Badge variant={val === 'active' ? 'success' : 'gray'}>
          {val === 'active' ? 'Aktif' : 'Nonaktif'}
        </Badge>
      )
    },
    { key: 'lastLogin', label: 'Login Terakhir' },
    { 
      key: 'actions', 
      label: 'Aksi',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
           <button 
             onClick={() => setSelectedUser(row)}
             className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-500 transition-colors border-0 bg-transparent cursor-pointer"
             title="Detail User"
           >
              <Eye size={16} />
           </button>
           <button 
             onClick={() => handleAction('impersonate', row)}
             className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-amber-500 transition-colors border-0 bg-transparent cursor-pointer"
             title="Login Sebagai"
           >
              <Zap size={16} />
           </button>
           {row.status === 'active' ? (
              <button 
                onClick={() => handleAction('deactivate', row)}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors border-0 bg-transparent cursor-pointer"
                title="Nonaktifkan"
              >
                 <ShieldX size={16} />
              </button>
           ) : (
              <button 
                onClick={() => handleAction('activate', row)}
                className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-emerald-500 transition-colors border-0 bg-transparent cursor-pointer"
                title="Aktifkan"
              >
                 <ShieldCheck size={16} />
              </button>
           )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Manajemen User" 
        subtitle="Kelola seluruh akun pengguna sistem, hak akses, dan penugasan role."
        action={
           <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} className="mr-2" /> Tambah User
           </Button>
        }
      />

      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-gray-100">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Cari nama atau email..."
                className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#DCAF01] transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-3 shrink-0">
              <Select 
                className="h-11 w-44"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                options={[
                  { label: 'Semua Role', value: 'Semua Role' },
                  { label: 'Super Admin', value: 'super_admin' },
                  { label: 'Admin Pusat', value: 'admin_pusat' },
                  { label: 'Admin Wilayah', value: 'admin_wilayah' },
                  { label: 'Member', value: 'member' },
                ]}
              />
              <Button variant="white" className="h-11 border-gray-200" onClick={fetchUsers}>
                 <Filter size={14} className="mr-2" /> Segarkan
              </Button>
           </div>
        </div>
        
        {loading && usersList.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <Loader2 size={40} className="animate-spin opacity-20" />
            <p className="font-medium animate-pulse">Memuat database pengguna...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={usersList} className="border-0 rounded-none" />
        )}
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Akun Pengguna Baru"
        size="lg"
        footer={
           <>
              <Button variant="white" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
              <Button onClick={() => { setIsAddModalOpen(false); toast.success('Fitur penambahan user via dashboard sedang disiapkan.'); }}>Simpan Akun</Button>
           </>
        }
      >
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-6">
              <Input label="Nama Lengkap" placeholder="Masukkan nama lengkap" />
              <Input label="Email Utama" type="email" placeholder="email@contoh.com" />
              <Select 
                label="Peran Akun (Role)"
                options={[
                  { label: 'Member', value: 'member' },
                  { label: 'Admin Wilayah', value: 'admin_wilayah' },
                  { label: 'Admin Pusat', value: 'admin_pusat' },
                  { label: 'Super Admin', value: 'super_admin' },
                ]}
              />
              <Select 
                label="Wilayah Tugas"
                options={[
                  { label: 'Pusat (Nasional)', value: 'pusat' },
                  { label: 'Kota Tasikmalaya', value: '10' },
                  { label: 'Kab. Garut', value: '11' },
                ]}
              />
           </div>
           <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
              <p className="text-[12px] text-amber-800 leading-relaxed font-medium italic">
                 Password default akan dikirimkan secara otomatis ke alamat email yang didaftarkan.
              </p>
           </div>
        </div>
      </Modal>

      {/* Detail User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Informasi Detail Pengguna"
        size="md"
        footer={<Button variant="white" onClick={() => setSelectedUser(null)}>Tutup</Button>}
      >
        {selectedUser && (
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="h-16 w-16 rounded-full bg-[#DCAF01]/10 flex items-center justify-center text-[#DCAF01]">
                    <UserIcon size={32} />
                 </div>
                 <div className="text-left">
                    <h3 className="text-[18px] font-semibold text-gray-900 uppercase">{selectedUser.fullName}</h3>
                    <p className="text-[13px] text-gray-500 font-medium">{selectedUser.email}</p>
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                 <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">Role Sistem</span>
                    <Badge variant="warning" className="capitalize">{selectedUser.role?.replace('_', ' ')}</Badge>
                 </div>
                 <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">Wilayah</span>
                    <span className="text-[13px] font-semibold text-gray-900">{selectedUser.wilayahName || 'Pusat'}</span>
                 </div>
                 <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">Status Akses</span>
                    <Badge variant={selectedUser.status === 'active' ? 'success' : 'gray'}>{selectedUser.status.toUpperCase()}</Badge>
                 </div>
                 <div className="flex justify-between py-2">
                    <span className="text-[12px] text-gray-500 font-semibold uppercase tracking-wider">Login Terakhir</span>
                    <span className="text-[13px] font-medium text-gray-700 flex items-center gap-1">
                       <Clock size={12} /> {selectedUser.lastLogin}
                    </span>
                 </div>
              </div>
           </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeAction}
        title={
          confirmAction?.type === 'impersonate' ? 'Gunakan Sesi User?' :
          confirmAction?.type === 'deactivate' ? 'Nonaktifkan Akses Akun?' :
          'Aktifkan Kembali Akun?'
        }
        message={
          confirmAction?.type === 'impersonate' ? `Anda akan dialihkan ke dashboard ${confirmAction?.user.fullName} dengan hak akses sesuai role-nya. Anda dapat kembali ke Super Admin kapan saja.` :
          confirmAction?.type === 'deactivate' ? `Pengguna ${confirmAction?.user.fullName} tidak akan bisa login ke sistem sampai diaktifkan kembali.` :
          `Akses login untuk ${confirmAction?.user.fullName} akan dipulihkan.`
        }
        variant={confirmAction?.type === 'deactivate' ? 'danger' : 'primary'}
        confirmLabel={confirmAction?.type === 'impersonate' ? 'Ya, Login Sebagai' : 'Ya, Lanjutkan'}
      />
    </div>
  );
};

export default UserManagementPage;
