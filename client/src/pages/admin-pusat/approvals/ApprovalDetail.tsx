import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  User as UserIcon,
  CreditCard,
  Loader2,
  MapPin,
  Eye,
  Hash,
  Mail,
  Phone,
  Calendar,
  Award
} from 'lucide-react';
import { approvalApi } from '../../../services/approvalApi';
import { toast } from '../../../stores/toastStore';
import Modal from '../../../components/ui/Modal';
import Badge from '../../../components/ui/Badge';
import { getSecureFileUrl } from '../../../services/api';
import { cn } from '../../../utils/cn';

import { useAuthStore } from '@/features/auth/stores/auth.store';

const ApprovalDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdminWilayah = user?.role === 'admin_wilayah';
  const basePath = isAdminWilayah ? '/app/admin-wilayah' : '/app/admin-pusat';

  const [loading, setLoading] = useState(true);
  const [approval, setApproval] = useState<any>(null);
  const [isProcessing, setIsSaving] = useState(false);
  const [showNik, setShowNik] = useState(false);
  
  const [noteModal, setNoteModal] = useState<{ show: boolean, type: 'approve' | 'reject' | 'revision' }>({
    show: false,
    type: 'approve'
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchApproval();
  }, [id]);

  const fetchApproval = async () => {
    try {
      setLoading(true);
      const res = await approvalApi.getById(id!);
      const data = res.data?.data || res.data;
      setApproval(data);
    } catch (err: any) {
      toast.error('Gagal mengambil data pengajuan');
      navigate(`${basePath}/members?tab=APPROVAL`);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (type: 'approve' | 'reject' | 'revision') => {
    setNoteModal({ show: true, type });
    setNotes('');
  };

  const handleConfirmAction = async () => {
    try {
      setIsSaving(true);
      if (noteModal.type === 'approve') {
        await approvalApi.approve(id!);
        toast.success('Pendaftaran anggota berhasil disetujui');
      } else if (noteModal.type === 'reject') {
        if (!notes.trim()) {
           toast.error('Harap berikan alasan penolakan');
           return;
        }
        await approvalApi.reject(id!, notes);
        toast.success('Pendaftaran anggota ditolak dan data dihapus');
      } else if (noteModal.type === 'revision') {
        if (!notes.trim()) {
           toast.error('Harap berikan instruksi revisi');
           return;
        }
        await approvalApi.requestRevision(id!, notes);
        toast.success('Permintaan revisi berhasil dikirim');
      }
      navigate(`${basePath}/members?tab=APPROVAL`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses keputusan');
    } finally {
      setIsSaving(false);
      setNoteModal({ ...noteModal, show: false });
    }
  };

  if (loading || !approval) {
    return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-[#DCAF01]" size={40} /></div>;
  }

  const pengaju = approval.creator;
  const profile = pengaju?.profile;

  const openWhatsApp = () => {
    if (!profile?.phone) {
      toast.error('Nomor WhatsApp tidak tersedia');
      return;
    }
    const phone = profile.phone.startsWith('0') ? '62' + profile.phone.slice(1) : profile.phone;
    const message = `Halo ${profile.fullName}, saya Admin ${isAdminWilayah ? 'Wilayah' : 'Pusat'} PPS Padjadjaran ingin melakukan verifikasi pendaftaran Anda.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const maskNik = (nik: string) => {
    if (!nik) return '-';
    if (showNik) return nik;
    return '*'.repeat(nik.length - 4) + nik.slice(-4);
  };

  return (
    <div className="space-y-6 animate-fade pb-12 text-left">
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(`${basePath}/members?tab=APPROVAL`)} 
          className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title="Peninjauan Pendaftaran" 
          subtitle="Verifikasi berkas, biodata, dan bukti bayar via WhatsApp." 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Documents and Details */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Document Review Section */}
           <Card title="Peninjauan Berkas" subtitle="Pastikan Pas Foto dan Surat Rekomendasi sudah sesuai standar.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                 {/* Photo Card */}
                 <div className="space-y-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-left flex items-center gap-2">
                       <UserIcon size={12} /> Pas Foto Resmi (4x6)
                    </p>
                    <div className="aspect-[3/4] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group relative shadow-inner">
                       {profile?.photoUrl ? (
                         <>
                           <img 
                             src={getSecureFileUrl(profile.photoUrl) || profile.photoUrl} 
                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                             alt="Foto Anggota" 
                           />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button 
                                variant="white" 
                                size="xs" 
                                onClick={() => window.open(getSecureFileUrl(profile.photoUrl) || profile.photoUrl)}
                                className="font-bold"
                              >
                                Perbesar Foto
                              </Button>
                           </div>
                         </>
                       ) : (
                         <div className="text-center space-y-2">
                            <UserIcon size={48} className="mx-auto text-gray-200" />
                            <p className="text-[11px] text-gray-400">Foto belum diunggah</p>
                         </div>
                       )}
                    </div>
                 </div>

                 {/* Recommendation Document Card */}
                 <div className="space-y-4">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-left flex items-center gap-2">
                       <FileText size={12} /> Surat Rekomendasi
                    </p>
                    <div className="aspect-[3/4] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center group relative shadow-inner">
                        {profile?.documentUrl ? (
                           <div className="text-center space-y-4 p-6">
                              <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                 <FileText size={40} className="text-blue-500" />
                              </div>
                              <div>
                                 <p className="text-[13px] font-bold text-gray-900">Dokumen Rekomendasi</p>
                                 <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tight">Format PDF/Gambar</p>
                              </div>
                              <Button 
                                variant="white" 
                                size="sm" 
                                onClick={() => window.open(getSecureFileUrl(profile.documentUrl) || profile.documentUrl)}
                                className="w-full font-bold border-blue-100 text-blue-600 hover:bg-blue-50"
                              >
                                Buka Dokumen
                              </Button>
                           </div>
                        ) : (
                           <div className="text-center space-y-2">
                              <XCircle size={48} className="mx-auto text-gray-200" />
                              <p className="text-[11px] text-gray-400">Belum ada rekomendasi</p>
                           </div>
                        )}
                    </div>
                 </div>
              </div>
           </Card>

           {/* Personal Info Section */}
           <Card title="Biodata Calon Anggota" subtitle="Informasi identitas yang didaftarkan oleh sistem.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12 text-left py-2">
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><UserIcon size={12} /> Nama Lengkap</p>
                    <p className="text-[15px] font-bold text-gray-900">{profile?.fullName || '-'}</p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Hash size={12} /> Nomor NIK</p>
                    <div className="flex items-center gap-2">
                       <p className="text-[15px] font-mono font-bold text-gray-900">{maskNik(profile?.nik)}</p>
                       <button onClick={() => setShowNik(!showNik)} className="p-1 text-gray-400 hover:text-gray-900 transition-colors border-0 bg-transparent cursor-pointer">
                          <Eye size={14} />
                       </button>
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Mail size={12} /> Alamat Email</p>
                    <p className="text-[14px] font-semibold text-gray-700">{pengaju?.email}</p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Phone size={12} /> WhatsApp</p>
                    <p className="text-[14px] font-bold text-emerald-600 font-mono">{profile?.phone || '-'}</p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> TTL</p>
                    <p className="text-[14px] font-semibold text-gray-700">
                        {profile?.birthPlace || '-'}, {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                    </p>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Award size={12} /> Tipe Keanggotaan</p>
                    <Badge variant="gray" className="tracking-widest uppercase font-bold">{profile?.memberType?.replace('_', ' ') || '-'}</Badge>
                 </div>
                 <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12} /> Wilayah Cabang</p>
                    <div className="flex items-center gap-1.5 text-gray-900">
                       <span className="text-[15px] font-bold">{profile?.region?.name || '-'}</span>
                    </div>
                 </div>
                 <div className="col-span-full space-y-1.5 pt-4 border-t border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12} /> Alamat Domisili</p>
                    <p className="text-[13px] font-medium text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                       "{profile?.address || 'Alamat tidak diisi.'}"
                    </p>
                 </div>
              </div>
           </Card>
        </div>

        {/* Right Section: Payment & Decision */}
        <div className="lg:col-span-4 space-y-6">
           {/* Payment Verification Card */}
           <Card title="Verifikasi Pembayaran" subtitle="Manual via WhatsApp.">
              <div className="space-y-4 text-left">
                 <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3 shadow-sm">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                          <CreditCard size={20} />
                       </div>
                       <p className="text-[13px] font-bold text-emerald-900">Bukti Transfer</p>
                    </div>
                    <p className="text-[12px] text-emerald-800 leading-relaxed font-medium">
                       Sesuai kebijakan, pendaftar harus mengirimkan bukti bayar melalui WhatsApp ke Admin Pusat.
                    </p>
                    <Button 
                       variant="white" 
                       className="w-full h-11 border-emerald-200 text-emerald-600 font-bold text-[12px] hover:bg-emerald-100 shadow-sm"
                       onClick={openWhatsApp}
                       icon={<Phone size={16} />}
                    >
                       Tanya Bukti Bayar
                    </Button>
                 </div>

                 <div className="space-y-3 pt-2">
                    <Button 
                       className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 border-0 font-bold text-[14px] shadow-lg shadow-emerald-500/10" 
                       icon={<CheckCircle2 size={20} />}
                       onClick={() => handleAction('approve')}
                    >
                       Setujui & Terbitkan KTA
                    </Button>
                    <Button 
                       variant="white" 
                       className="w-full h-12 border-red-100 text-red-600 hover:bg-red-50 font-bold text-[13px]" 
                       icon={<XCircle size={18} />}
                       onClick={() => handleAction('reject')}
                    >
                       Tolak & Hapus Data
                    </Button>
                 </div>
              </div>
           </Card>

           {/* Workflow Guide */}
           <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 space-y-5 text-left shadow-sm">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                    <FileText size={20} />
                 </div>
                 <p className="text-[14px] font-bold text-blue-900 uppercase tracking-tight">Prosedur Verif</p>
              </div>
              <ul className="text-[12px] text-blue-700 space-y-3 font-medium">
                 <li className="flex gap-2 leading-tight"><div className="h-4 w-4 bg-blue-200 rounded-full flex items-center justify-center shrink-0 text-[10px]">1</div> Periksa kecocokan foto dengan NIK pendaftar.</li>
                 <li className="flex gap-2 leading-tight"><div className="h-4 w-4 bg-blue-200 rounded-full flex items-center justify-center shrink-0 text-[10px]">2</div> Pastikan Surat Rekomendasi asli dan valid.</li>
                 <li className="flex gap-2 leading-tight"><div className="h-4 w-4 bg-blue-200 rounded-full flex items-center justify-center shrink-0 text-[10px]">3</div> Konfirmasi pembayaran Iuran Anggota di WhatsApp.</li>
                 <li className="flex gap-2 leading-tight font-bold"><div className="h-4 w-4 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 text-[10px]">4</div> Klik Setujui untuk aktivasi akun pendaftar.</li>
              </ul>
           </div>
        </div>
      </div>

      {/* Decision Modal */}
      <Modal 
        isOpen={noteModal.show} 
        onClose={() => setNoteModal({ ...noteModal, show: false })}
        title={
           noteModal.type === 'approve' ? 'Konfirmasi Persetujuan' : 
           noteModal.type === 'reject' ? 'Tolak Pendaftaran' : 'Minta Revisi Data'
        }
      >
        <div className="space-y-6 text-left">
           <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[13px] text-gray-600 font-bold leading-relaxed">
                 {noteModal.type === 'approve' ? 'Apakah Anda sudah memverifikasi bukti pembayaran dan berkas fisik pendaftar ini? Setelah disetujui, akun akan aktif dan nomor KTA diterbitkan.' : 
                  noteModal.type === 'reject' ? 'PERHATIAN: Penolakan akan menghapus pendaftar ini secara permanen dari sistem. Berikan alasan:' : 
                  'Instruksikan bagian mana yang harus diperbaiki oleh pendaftar:'}
              </p>
           </div>
           
           {(noteModal.type === 'reject' || noteModal.type === 'revision') && (
              <textarea 
                className="w-full p-4 h-32 bg-gray-50 border-2 border-gray-100 rounded-2xl text-[13px] font-medium outline-none focus:border-[#DCAF01] transition-all"
                placeholder="Tuliskan catatan untuk pendaftar..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
           )}

           <div className="flex gap-3">
              <Button variant="white" className="flex-1" onClick={() => setNoteModal({ ...noteModal, show: false })}>Batalkan</Button>
              <Button 
                isLoading={isProcessing}
                className={cn(
                  "flex-[2] font-bold h-12 shadow-md",
                  noteModal.type === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                  noteModal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'
                )} 
                onClick={handleConfirmAction}
              >
                 {noteModal.type === 'approve' ? 'Ya, Verifikasi Selesai' : 'Kirim Keputusan'}
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalDetail;
