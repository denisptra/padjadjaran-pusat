import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Skeleton from '../../../components/ui/Skeleton';
import { 
  ShieldCheck, 
  Save, 
  RotateCcw, 
  Check, 
  X,
  Info,
  Loader2
} from 'lucide-react';
import { ROLES } from '../../../config/roles';
import { cn } from '../../../utils/cn';
import { toast } from '../../../stores/toastStore';
import { superAdminApi } from '../../../services/superAdminApi';

const ActionMatrixPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>(ROLES.MEMBER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrixData, setMatrixData] = useState<any[]>([]);

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getActionMatrix();
      setMatrixData(res.data);
    } catch (err) {
      toast.error('Gagal memuat matriks aksi.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAction = (action: string) => {
    setMatrixData(prev => prev.map(item => {
      if (item.role === selectedRole && item.action === action) {
        return { ...item, isAllowed: !item.isAllowed };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentRoleData = matrixData.filter(item => item.role === selectedRole);
      await Promise.all(currentRoleData.map(item => 
        superAdminApi.updateActionMatrix({
          role: item.role,
          action: item.action,
          isAllowed: item.isAllowed
        })
      ));
      toast.success('Konfigurasi Matriks Aksi berhasil disimpan.');
      fetchMatrix();
    } catch (err) {
      toast.error('Gagal menyimpan matriks aksi.');
    } finally {
      setSaving(false);
    }
  };

  // Group actions by module (prefix before dot)
  const roleActions = matrixData.filter(item => item.role === selectedRole);
  const modules: Record<string, any[]> = {};
  
  roleActions.forEach(item => {
    const [moduleName] = item.action.split('.');
    if (!modules[moduleName]) modules[moduleName] = [];
    modules[moduleName].push(item);
  });

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Matriks Aksi" 
        subtitle="Konfigurasi hak akses (Permissions) secara granular untuk setiap role sistem."
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Role Selection */}
        <div className="lg:w-64 shrink-0 space-y-4">
           <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Pilih Role</p>
           <div className="flex flex-col gap-1 bg-white border border-gray-200 rounded-md overflow-hidden p-1">
              {Object.entries(ROLES).map(([key, value]) => (
                <button
                  key={value}
                  onClick={() => setSelectedRole(value)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-[13px] font-semibold rounded transition-all border-0 cursor-pointer capitalize",
                    selectedRole === value ? "bg-[#DCAF01] text-gray-900" : "bg-transparent text-gray-500 hover:bg-gray-50"
                  )}
                >
                   {value?.replace('_', ' ')}
                </button>
              ))}
           </div>
           
           <div className="p-4 bg-blue-50 border border-blue-100 rounded-md">
              <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold text-[12px]">
                 <Info size={14} /> Informasi
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                 Matriks Aksi mengatur visibilitas tombol dan kemampuan eksekusi aksi di dashboard. Perubahan akan berdampak langsung pada seluruh user dengan role terkait.
              </p>
           </div>
        </div>

        {/* Matrix Grid */}
        <div className="flex-1 space-y-6">
           <Card 
             title={loading ? 'Memuat izin akses...' : `Izin Akses: ${selectedRole?.replace('_', ' ')}`}
             action={
                <div className="flex gap-2">
                   <Button variant="white" size="sm" onClick={fetchMatrix}>
                      <RotateCcw size={14} className="mr-2" /> Segarkan
                   </Button>
                   <Button size="sm" onClick={handleSave} isLoading={saving}>
                      <Save size={14} className="mr-2" /> Simpan Perubahan
                   </Button>
                </div>
             }
           >
              <div className="divide-y divide-gray-100">
                 {loading ? (
                    [...Array(3)].map((_, i) => (
                       <div key={i} className="py-6 first:pt-0 last:pb-0">
                          <Skeleton className="h-5 w-32 mb-4" />
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {[...Array(3)].map((_, j) => (
                                <Skeleton key={j} className="h-16 w-full rounded-md" />
                             ))}
                          </div>
                       </div>
                    ))
                 ) : Object.entries(modules).length === 0 ? (
                   <div className="py-10 text-center text-gray-400">
                      Tidak ada aksi yang terdaftar untuk role ini.
                   </div>
                 ) : Object.entries(modules).map(([moduleName, actions]) => (
                    <div key={moduleName} className="py-6 first:pt-0 last:pb-0">
                       <h4 className="text-[14px] font-semibold text-gray-900 uppercase mb-4 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#DCAF01]" />
                          Module {moduleName}
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {actions.map((item) => {
                             const actionName = item.action.split('.')[1] || item.action;
                             return (
                               <div 
                                 key={item.id || item.action}
                                 onClick={() => toggleAction(item.action)}
                                 className={cn(
                                   "flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer group",
                                   item.isAllowed ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50 border-gray-100 opacity-60"
                                 )}
                               >
                                  <div className="flex items-center gap-3">
                                     <div className={cn(
                                       "h-7 w-7 rounded-full flex items-center justify-center transition-colors",
                                       item.isAllowed ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-400"
                                     )}>
                                        {item.isAllowed ? <Check size={14} /> : <X size={14} />}
                                     </div>
                                     <div className="text-left">
                                        <p className="text-[12px] font-semibold text-gray-900 capitalize">{actionName}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Hak akses {actionName} {moduleName}</p>
                                     </div>
                                  </div>
                                  <div className={cn(
                                     "w-8 h-4 rounded-full relative transition-colors",
                                     item.isAllowed ? "bg-emerald-500" : "bg-gray-300"
                                  )}>
                                     <div className={cn(
                                        "absolute top-0.5 h-3 w-3 bg-white rounded-full transition-all",
                                        item.isAllowed ? "right-0.5" : "left-0.5"
                                     )} />
                                  </div>
                               </div>
                             );
                          })}
                       </div>
                    </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default ActionMatrixPage;
