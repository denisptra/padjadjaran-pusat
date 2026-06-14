import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { GoogleIcon } from '../../components/ui/Icons';
import { useState } from 'react';
import { publicApi } from '../../services/publicApi';
import { toast } from '../../stores/toastStore';

export default function VerificationPage() {
  const [ktaNumber, setKtaNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheck = async () => {
    const kta = ktaNumber.trim();
    if (!kta) {
      toast.error('Masukkan nomor KTA terlebih dahulu');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const res = await publicApi.verifyMember(kta);
      setResult(res.data);
      toast.success('Nomor KTA terverifikasi!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nomor KTA tidak terdaftar atau tidak ditemukan');
      toast.error('Verifikasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between font-inter">
      <div>
        <PublicNavbar />
        <main className="pt-44 pb-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-cinzel font-semibold text-stone-900 ">Verifikasi Anggota</h1>
              <p className="text-stone-500 text-[13px] leading-relaxed max-w-md mx-auto font-medium">Masukkan nomor KTA (Kartu Tanda Anggota) Anda untuk memverifikasi status keanggotaan resmi di Perguruan Padjadjaran.</p>
            </div>

            <div className="bg-stone-50 p-8 md:p-12 rounded-3xl border border-stone-100 shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-full -mr-16 -mt-16" />
              <div className="space-y-6 relative z-10">
                <div className="w-20 h-20 bg-[#C9A227]/10 rounded-2xl flex items-center justify-center text-[#C9A227] mx-auto mb-6">
                  <GoogleIcon name="verified_user" size={40} />
                </div>
                <Input 
                  placeholder="Contoh: PP-2026-XXXXXX" 
                  value={ktaNumber}
                  onChange={(e) => setKtaNumber(e.target.value)}
                  className="text-center font-medium"
                  disabled={loading}
                />
                <Button 
                  onClick={handleCheck} 
                  isLoading={loading}
                  className="w-full h-11 text-[13px] font-semibold shadow-xl shadow-[#C9A227]/20  tracking-normal"
                >
                  Cek Status Keanggotaan
                </Button>
              </div>
              <p className="text-[11px] text-stone-400 font-medium">Pastikan nomor KTA sesuai dengan yang tertera pada kartu fisik atau portal pendaftaran digital.</p>

              {result && (
                <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-left space-y-4 animate-fadeIn relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                      <GoogleIcon name="check" size={16} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-emerald-800">ANGGOTA TERVERIFIKASI</h4>
                      <p className="text-[11px] text-emerald-600 font-medium">Status Keanggotaan Aktif & Resmi</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-emerald-100 pt-4 text-[12px]">
                    <div>
                      <p className="text-emerald-600/70 font-semibold uppercase text-[9px]">Nama Lengkap</p>
                      <p className="font-semibold text-emerald-950 uppercase">{result.fullName}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600/70 font-semibold uppercase text-[9px]">Nomor KTA</p>
                      <p className="font-mono font-semibold text-emerald-950">{result.ktaNumber}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600/70 font-semibold uppercase text-[9px]">Cabang / Wilayah</p>
                      <p className="font-semibold text-emerald-950">{result.region?.name || 'Pusat'}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600/70 font-semibold uppercase text-[9px]">Tanggal Terdaftar</p>
                      <p className="font-semibold text-emerald-950">{new Date(result.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-8 p-6 bg-rose-50 border border-rose-200 rounded-2xl text-left space-y-2 animate-fadeIn relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0">
                      <GoogleIcon name="close" size={16} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-semibold text-rose-800">TIDAK TERDAFTAR</h4>
                      <p className="text-[11px] text-rose-600 font-medium">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}

