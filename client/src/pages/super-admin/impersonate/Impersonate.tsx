import React, { useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Zap, 
  User as UserIcon,
  Shield,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';
import { users } from '../../../mocks/data';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { toast } from '../../../stores/toastStore';
import ConfirmationModal from '../../../components/ui/ConfirmModal';

const ImpersonatePage: React.FC = () => {
  const { startImpersonate } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Semua Role');
  const [confirmUser, setConfirmUser] = useState<any>(null);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'Semua Role' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleImpersonate = () => {
    if (!confirmUser) return;
    toast.success(`Mengalihkan sesi ke ${confirmUser.fullName}...`);
    setTimeout(() => {
       startImpersonate(confirmUser);
       setConfirmUser(null);
    }, 1000);
  };

  const columns = [
    { 
      key: 'user', 
      label: 'Pengguna',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <UserIcon size={14} />
           </div>
           <div>
              <p className="text-[13px] font-semibold text-gray-900 leading-none mb-1">{row.fullName}</p>
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
      key: 'actions', 
      label: 'Sesi',
      render: (_: any, row: any) => (
        <Button 
          variant="white" 
          size="sm" 
          className="h-8 px-3 text-[11px] font-semibold border-gray-200 text-amber-600 hover:bg-amber-50 hover:border-amber-200"
          onClick={() => setConfirmUser(row)}
        >
           <Zap size={14} className="mr-1.5" /> Login Sebagai
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Simulasi Pengguna" 
        subtitle="Simulasi login sebagai user lain untuk keperluan debugging atau bantuan teknis."
      />

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-md flex gap-4">
         <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldCheck size={20} />
         </div>
         <div>
            <p className="text-[13px] font-semibold text-amber-900">Perhatian Keamanan</p>
            <p className="text-[12px] text-amber-800 leading-relaxed font-medium">
               Seluruh aktivitas Anda saat menggunakan sesi user lain akan dicatat dalam Audit Log sebagai tindakan <strong>"Impersonation"</strong>. Gunakan fitur ini hanya jika benar-benar diperlukan.
            </p>
         </div>
      </div>

      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-gray-100">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Cari user berdasarkan nama atau email..."
                className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#DCAF01] transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Select 
             className="h-11 w-44"
             value={filterRole}
             onChange={(e) => setFilterRole(e.target.value)}
             options={[
               { label: 'Semua Role', value: 'Semua Role' },
               { label: 'Admin Pusat', value: 'admin_pusat' },
               { label: 'Admin Wilayah', value: 'admin_wilayah' },
               { label: 'Member', value: 'member' },
             ]}
           />
        </div>
        <DataTable columns={columns} data={filteredUsers} className="border-0 rounded-none" />
      </Card>

      <ConfirmationModal 
        isOpen={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={handleImpersonate}
        title="Mulai Simulasi Sesi?"
        message={`Anda akan masuk ke portal sebagai ${confirmUser?.fullName}. Anda dapat kembali ke Super Admin dengan menekan tombol banner yang muncul nanti.`}
        variant="primary"
        confirmLabel="Ya, Gunakan Sesi"
      />
    </div>
  );
};

export default ImpersonatePage;

