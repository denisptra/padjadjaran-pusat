import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { 
  Save, 
  Info,
  Loader2,
  CreditCard,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import { paymentSettingsApi } from '../../../services/paymentSettingsApi';
import { cn } from '../../../utils/cn';

const PaymentSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingId, setSettingId] = useState('REGISTRATION'); // Default to type
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    accountOwner: '',
    amount: 150000,
    whatsapp: '',
    instruction: '',
    isActive: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await paymentSettingsApi.getAll();
      
      // Navigate nested structure from Interceptor + Repository
      // res.data (Axios) -> .data (Interceptor) -> .data (Repository)
      const data = res.data?.data?.data || res.data?.data || res.data;
      
      let settings = [];
      if (Array.isArray(data)) {
        settings = data;
      } else if (data && Array.isArray(data.items)) {
        settings = data.items;
      } else if (data && typeof data === 'object') {
        settings = [data];
      }

      const regSetting = settings.find((s: any) => s.type === 'REGISTRATION') || settings[0];
      
      if (regSetting) {
        if (regSetting.id) setSettingId(regSetting.id);
        setFormData({
          bankName: regSetting.bankName || '',
          accountNumber: regSetting.accountNumber || '',
          accountOwner: regSetting.accountOwner || '',
          amount: regSetting.amount || 150000,
          whatsapp: regSetting.whatsapp || '',
          instruction: regSetting.instruction || '',
          isActive: regSetting.isActive ?? true
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch payment settings:', err);
      toast.error(`Gagal memuat pengaturan: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check
    const finalId = settingId || 'REGISTRATION';

    try {
      setSaving(true);
      await paymentSettingsApi.update(finalId, formData);
      toast.success('Konfigurasi pembayaran berhasil diperbarui');
      // No need to full refetch if success, but good for sync
      setTimeout(() => fetchSettings(), 500);
    } catch (err: any) {
      console.error('Failed to save payment settings:', err);
      const errMsg = err.response?.data?.message || err.message;
      toast.error(`Gagal menyimpan: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settingId) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <Loader2 size={48} className="animate-spin opacity-20" />
        <p className="text-[13px] font-medium">Memuat konfigurasi pembayaran...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <PageHeader 
        title="Konfigurasi Pembayaran" 
        subtitle="Atur instruksi transfer dan detail rekening untuk pendaftaran nasional."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave}>
            <Card title="Detail rekening utama" subtitle="Informasi ini akan muncul pada dashboard pendaftar baru.">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Nama bank" 
                    value={formData.bankName}
                    onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                    placeholder="Misal: Bank Mandiri"
                    required
                  />
                  <Input 
                    label="Nomor rekening" 
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                    placeholder="1234567890"
                    required
                  />
                </div>

                <Input 
                  label="Nama pemilik rekening" 
                  value={formData.accountOwner}
                  onChange={(e) => setFormData({...formData, accountOwner: e.target.value})}
                  placeholder="Nama sesuai di buku tabungan"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Biaya pendaftaran (Rp)" 
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                    required
                  />
                  <Input 
                    label="No. WhatsApp konfirmasi" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    placeholder="6281234567890"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-400">Instruksi pembayaran</label>
                  <textarea 
                    rows={6}
                    className="w-full p-4 border-2 border-gray-100 rounded-xl text-[13px] font-normal outline-none focus:border-[#DCAF01] transition-all leading-relaxed"
                    value={formData.instruction}
                    onChange={(e) => setFormData({...formData, instruction: e.target.value})}
                    placeholder="Tulis langkah-langkah transfer di sini..."
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 text-left">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-white",
                      formData.isActive ? "bg-emerald-500" : "bg-gray-400"
                    )}>
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-900">Status aktif</p>
                      <p className="text-[11px] text-gray-500 font-normal">Aktifkan untuk menerima pembayaran</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <Button type="submit" isLoading={saving} className="font-medium text-[12px]" icon={<Save size={18} />}>Simpan konfigurasi</Button>
                </div>
              </div>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
           <Card title="Pratinjau instruksi" subtitle="Tampilan yang akan dilihat oleh calon anggota.">
              <div className="space-y-6 text-left">
                 <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                       <CreditCard size={120} />
                    </div>
                    <div className="relative z-10 space-y-4">
                       <p className="text-[11px] font-medium text-gray-400">Bank transfer</p>
                       <h3 className="text-[24px] font-medium tracking-tight">{formData.bankName || 'Nama bank'}</h3>
                       <p className="text-[20px] font-mono font-medium">{formData.accountNumber || '0000-0000-0000'}</p>
                       <div className="pt-2">
                          <p className="text-[10px] font-medium text-gray-400 mb-1">Nama pemilik</p>
                          <p className="text-[14px] font-medium">{formData.accountOwner || 'Pemilik rekening'}</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 text-emerald-600 font-medium text-[12px]">
                       <AlertCircle size={16} /> Total tagihan
                    </div>
                    <p className="text-[28px] font-medium text-gray-900">Rp {formData.amount.toLocaleString()}</p>
                    <div className="h-px bg-gray-200 w-full" />
                    <div className="space-y-2">
                       <p className="text-[11px] font-medium text-gray-400">Instruksi:</p>
                       <div className="text-[13px] text-gray-600 font-normal leading-relaxed whitespace-pre-line">
                          {formData.instruction || 'Belum ada instruksi ditambahkan.'}
                       </div>
                    </div>
                 </div>

                 <Button variant="white" className="w-full border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 h-12 font-medium text-[12px]">
                    <MessageCircle size={18} className="mr-2" /> Konfirmasi via WhatsApp
                 </Button>
              </div>
           </Card>

           <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
              <Info className="text-amber-500 shrink-0" size={20} />
              <p className="text-[12px] text-amber-800 font-normal leading-relaxed">
                 Perubahan data ini akan langsung berdampak pada seluruh pendaftar baru. Harap pastikan detail rekening sudah benar.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
