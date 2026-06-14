import React, { useEffect, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { 
  Settings, 
  Save, 
  Check, 
  X,
  Zap,
  Megaphone,
  Globe,
  Database,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { toast } from '../../../stores/toastStore';
import { superAdminApi } from '../../../services/superAdminApi';

interface SystemFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  lastUpdated: string;
}

const FeatureControlPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<SystemFeature[]>([
    { id: 'registration.enabled', name: 'Registrasi Anggota Baru', description: 'Aktifkan form pendaftaran untuk publik secara online.', enabled: true, lastUpdated: '-' },
    { id: 'cms.enabled', name: 'Manajemen Konten (CMS)', description: 'Aktifkan fitur edit slider, berita, artikel, dan galeri website.', enabled: true, lastUpdated: '-' },
    { id: 'impersonate.enabled', name: 'Simulasi Sesi (Simulasi Pengguna)', description: 'Izinkan super admin untuk login mensimulasikan user lain.', enabled: true, lastUpdated: '-' },
    { id: 'backup.auto', name: 'Pencadangan Data Otomatis', description: 'Jalankan scheduler script backup database harian.', enabled: false, lastUpdated: '-' },
    { id: 'otp.enabled', name: 'Verifikasi Email via OTP', description: 'Wajibkan kode OTP 6 digit saat ganti email/password.', enabled: true, lastUpdated: '-' },
    { id: 'maintenance.mode', name: 'Mode Pemeliharaan', description: 'Kunci seluruh akses portal dan arahkan ke halaman pemeliharaan.', enabled: false, lastUpdated: '-' },
  ]);

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getFeatureControl();
      const backendFeatures = res.data;
      
      setFeatures(prev => prev.map(f => {
        const found = backendFeatures.find((bf: any) => bf.featureKey === f.id);
        if (found) {
          return {
            ...f,
            enabled: found.isEnabled,
            lastUpdated: new Date(found.updatedAt).toLocaleString('id-ID')
          };
        }
        return f;
      }));
    } catch (err) {
      toast.error('Gagal memuat kontrol fitur.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (id: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(features.map(f => 
        superAdminApi.updateFeatureControl(f.id, { isEnabled: f.enabled })
      ));
      toast.success('Konfigurasi fitur sistem berhasil disimpan.');
      fetchFeatures();
    } catch (err) {
      toast.error('Gagal menyimpan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && features[0].lastUpdated === '-') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 size={48} className="animate-spin opacity-20" />
        <p className="font-medium animate-pulse">Memuat konfigurasi fitur...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Kontrol Fitur" 
        subtitle="Atur aktifasi fitur sistem (Feature Flags) secara real-time melalui panel kontrol."
      />

      <div className="space-y-6">
        <Card 
          title="Daftar Fitur Sistem" 
          subtitle="Gunakan toggle untuk mengaktifkan atau menonaktifkan modul dashboard."
          action={
            <Button size="sm" onClick={handleSave} isLoading={saving}>
              <Save size={16} className="mr-2" /> Simpan Konfigurasi
            </Button>
          }
        >
          <div className="overflow-x-auto border border-[#E5E7EB] rounded-md">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-[#E5E7EB] text-gray-700 font-medium">
                  <th className="px-6 py-4 font-medium">Nama Fitur</th>
                  <th className="px-6 py-4 font-medium">Deskripsi</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-center">Toggle</th>
                  <th className="px-6 py-4 font-medium">Terakhir Diubah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {features.map((feature) => (
                  <tr 
                    key={feature.id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0",
                          feature.enabled ? "bg-[#DCAF01]" : "bg-gray-300"
                        )} />
                        {feature.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-sm">
                      {feature.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={feature.enabled ? "success" : "danger"}>
                        {feature.enabled ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => toggleFeature(feature.id)}
                          className={cn(
                            "w-10 h-5 rounded-full relative transition-colors duration-200 border-0 focus:outline-none cursor-pointer",
                            feature.enabled ? "bg-[#DCAF01]" : "bg-gray-300"
                          )}
                        >
                          <div className={cn(
                            "absolute top-0.5 h-4 w-4 bg-white rounded-full transition-all shadow-sm",
                            feature.enabled ? "left-[22px]" : "left-0.5"
                          )} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-[12px]">
                      {feature.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-md flex gap-3">
          <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-[13px] font-semibold text-amber-800 mb-0.5">Perhatian Penting</h5>
            <p className="text-[12px] text-amber-700 leading-relaxed font-medium">
              Menonaktifkan fitur inti sistem seperti <strong>Registrasi</strong> atau <strong>CMS Website</strong> akan langsung menonaktifkan portal pendaftaran publik dan panel edit slider. Harap simpan konfigurasi untuk menerapkan perubahan ke server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureControlPage;
