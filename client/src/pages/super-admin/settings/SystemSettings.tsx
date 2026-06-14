import React, { useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { 
  Settings, 
  Save, 
  ShieldAlert, 
  Mail, 
  Clock, 
  HelpCircle,
  Globe,
  Lock,
  Phone,
  Info
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import { cn } from '../../../utils/cn';

const SystemSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    appName: 'PPS Padjadjaran Portal',
    maintenanceMode: false,
    sessionTimeout: '60',
    emailOtp: true,
    loginAttempts: '5',
    supportContact: '0812-3456-7890',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Konfigurasi sistem berhasil diperbarui.');
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Pengaturan Sistem" 
        subtitle="Konfigurasi teknis level aplikasi dan kebijakan keamanan global."
      />

      <form onSubmit={handleSave} className="w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* General Settings */}
           <div className="space-y-6">
              <Card title="Identitas Aplikasi">
                 <div className="space-y-4">
                    <Input 
                      label="Nama Aplikasi Portal" 
                      value={formData.appName}
                      onChange={(e) => setFormData({...formData, appName: e.target.value})}
                      icon={<Globe size={16} />}
                    />
                    <Input 
                      label="Kontak Support" 
                      value={formData.supportContact}
                      onChange={(e) => setFormData({...formData, supportContact: e.target.value})}
                      icon={<Phone size={16} />}
                    />
                 </div>
              </Card>

              <Card title="Sesi & Akses">
                 <div className="space-y-4">
                    <Select 
                      label="Session Timeout (Menit)"
                      value={formData.sessionTimeout}
                      onChange={(e) => setFormData({...formData, sessionTimeout: e.target.value})}
                      options={[
                        { label: '30 Menit', value: '30' },
                        { label: '60 Menit', value: '60' },
                        { label: '120 Menit', value: '120' },
                        { label: '24 Jam', value: '1440' },
                      ]}
                    />
                    <Select 
                      label="Batas Percobaan Login"
                      value={formData.loginAttempts}
                      onChange={(e) => setFormData({...formData, loginAttempts: e.target.value})}
                      options={[
                        { label: '3 Kali', value: '3' },
                        { label: '5 Kali', value: '5' },
                        { label: '10 Kali', value: '10' },
                      ]}
                    />
                 </div>
              </Card>
           </div>

           {/* Security & Maintenance */}
           <div className="space-y-6">
              <Card title="Fitur Keamanan">
                 <div className="space-y-5 py-2">
                    <div 
                      onClick={() => setFormData({...formData, emailOtp: !formData.emailOtp})}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer",
                        formData.emailOtp ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50 border-gray-100"
                      )}
                    >
                       <div className="flex items-center gap-3">
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", formData.emailOtp ? "bg-emerald-100 text-emerald-600" : "bg-gray-200 text-gray-400")}>
                             <Mail size={14} />
                          </div>
                          <div>
                             <p className="text-[12px] font-semibold text-gray-900 leading-none mb-1">Email OTP Aktif</p>
                             <p className="text-[10px] text-gray-500 font-medium">Verifikasi email saat login baru.</p>
                          </div>
                       </div>
                       <div className={cn("w-8 h-4 rounded-full relative transition-all", formData.emailOtp ? "bg-emerald-500" : "bg-gray-300")}>
                          <div className={cn("absolute top-0.5 h-3 w-3 bg-white rounded-full transition-all", formData.emailOtp ? "right-0.5" : "left-0.5")} />
                       </div>
                    </div>

                    <div 
                      onClick={() => setFormData({...formData, maintenanceMode: !formData.maintenanceMode})}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer",
                        formData.maintenanceMode ? "bg-red-50/50 border-red-100" : "bg-gray-50 border-gray-100"
                      )}
                    >
                       <div className="flex items-center gap-3">
                          <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", formData.maintenanceMode ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-400")}>
                             <ShieldAlert size={14} />
                          </div>
                          <div>
                             <p className="text-[12px] font-semibold text-gray-900 leading-none mb-1">Maintenance Mode</p>
                             <p className="text-[10px] text-gray-500 font-medium">Kunci dashboard untuk umum.</p>
                          </div>
                       </div>
                       <div className={cn("w-8 h-4 rounded-full relative transition-all", formData.maintenanceMode ? "bg-red-500" : "bg-gray-300")}>
                          <div className={cn("absolute top-0.5 h-3 w-3 bg-white rounded-full transition-all", formData.maintenanceMode ? "right-0.5" : "left-0.5")} />
                       </div>
                    </div>
                 </div>
              </Card>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-md flex gap-3">
                 <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    Perubahan pada pengaturan ini memerlukan restart pada server cache sistem agar berdampak ke seluruh user.
                 </p>
              </div>
           </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
           <Button type="submit" isLoading={loading} className="px-12 font-semibold h-12 shadow-lg shadow-[#DCAF01]/10">
              <Save size={18} className="mr-2" /> Simpan Pengaturan Sistem
           </Button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettingsPage;

