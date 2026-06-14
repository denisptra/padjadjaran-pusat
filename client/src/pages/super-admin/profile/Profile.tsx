import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { 
  User, 
  Mail, 
  ShieldCheck,
  Clock,
  Calendar,
  Save,
  Camera
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import { authApi } from '@/features/auth/services/auth.service';

const SuperAdminProfileView: React.FC = () => {
  const { user, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.updateProfile(formData);
      await fetchProfile();
      toast.success('Profil administrator diperbarui.');
    } catch (err) { toast.error('Gagal memperbarui profil.'); } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
       <div className="lg:col-span-4 space-y-6">
          <Card title="Identitas Admin">
             <div className="flex flex-col items-center py-6">
                <div className="h-24 w-24 bg-[#111827] rounded-xl flex items-center justify-center text-white mb-4 relative overflow-hidden group border border-gray-800 shadow-xl">
                   <User size={48} className="opacity-30" />
                   <button className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white border-0 cursor-pointer" type="button">
                      <Camera size={18} />
                   </button>
                </div>
                <h2 className="text-[18px] font-semibold text-gray-900 uppercase tracking-tight">{formData.fullName}</h2>
                <Badge variant="danger" className="mt-2 uppercase tracking-widest px-4 py-1 font-semibold text-[9px]">Admin Super</Badge>
             </div>
             <div className="border-t border-gray-100 pt-5 space-y-3">
                <div className="flex justify-between items-center text-[12px]">
                   <span className="text-gray-500 font-medium">Level Akses</span>
                   <span className="text-gray-900 font-semibold uppercase tracking-wider">FULL ACCESS</span>
                </div>
             </div>
          </Card>
       </div>

       <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
             <Card title="Data Otoritas" subtitle="Identitas resmi pengelola pusat sistem.">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Input label="Nama Administrator" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} icon={<User size={16} />} />
                   <Input label="Email Otoritas" type="email" value={user?.email} disabled icon={<Mail size={16} />} className="bg-gray-50" />
                </div>
             </Card>

             <Card title="Pemantauan Sesi">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <Clock size={20} className="text-gray-400" />
                      <div>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Terakhir Login</p>
                         <p className="text-[13px] text-gray-900 font-semibold">Aktif Sekarang</p>
                      </div>
                   </div>
                </div>
             </Card>

             <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button type="submit" isLoading={loading} className="px-12 font-semibold shadow-lg shadow-[#DCAF01]/10 uppercase">
                   Simpan Pembaruan
                </Button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default SuperAdminProfileView;
