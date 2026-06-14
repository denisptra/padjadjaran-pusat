import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import KTACard from '../../components/ui/KTACard';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Skeleton from '../../components/ui/Skeleton';
import { 
  ChevronLeft, 
  User, 
  User as UserIcon,
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  Edit, 
  UserCheck, 
  UserMinus,
  Award,
  Clock,
  Hash,
  Eye,
  EyeOff,
  Calendar,
  Loader2,
  FileText
} from 'lucide-react';
import { memberApi } from '../../services/memberApi';
import { toast } from '../../stores/toastStore';
import { API_URL } from '../../services/api';

const MemberDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [showNik, setShowNik] = useState(false);
  
  const isAdminPusatRoute = location.pathname.includes('admin-pusat');
  const isAdminWilayahRoute = location.pathname.includes('admin-wilayah');

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const res = await memberApi.getById(id!);
      setMember(res.data?.data || res.data);
    } catch (err) {
      toast.error('Gagal mengambil data anggota');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const maskNik = (nik: string) => {
    if (!nik) return '-';
    if (showNik) return nik;
    return '*'.repeat(nik.length - 4) + nik.slice(-4);
  };

  const toggleStatus = async () => {
     try {
        setActionLoading(true);
        const currentStatus = member.user?.status;
        if (currentStatus === 'ACTIVE') {
          await memberApi.deactivate(id!);
          toast.success(`Anggota ${member.fullName} berhasil dinonaktifkan.`);
        } else {
          await memberApi.activate(id!);
          toast.success(`Anggota ${member.fullName} berhasil diaktifkan.`);
        }
        fetchMember();
     } catch (err) {
        toast.error('Gagal mengubah status anggota');
     } finally {
        setActionLoading(false);
     }
  };

  if (!loading && !member) return null;

  return (
    <div className="space-y-8 animate-fade pb-10 text-left w-full">
      
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4">
         <button 
           type="button"
           onClick={() => navigate(-1)}
           className="h-9 w-9 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
         >
            <ChevronLeft size={20} />
         </button>
         <PageHeader 
           title="Detail Profil Anggota" 
           subtitle={loading ? 'Memuat informasi...' : `Informasi keanggotaan dan profil lengkap dari ${member?.fullName}.`}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
         
         <div className="lg:col-span-5 space-y-6">
            <Card title="Identitas Digital Resmi" subtitle="Kartu Tanda Anggota Elektronik PPS Padjadjaran">
               <div className="flex justify-center items-center py-4">
                  {loading ? (
                    <Skeleton className="aspect-[1.58/1] w-full max-w-[340px] sm:max-w-[410px] md:max-w-[450px] rounded-2xl" />
                  ) : (
                    <KTACard 
                      fullName={member.fullName}
                      ktaNumber={member.ktaNumber}
                      memberType={member.memberType}
                      wilayahName={member.city || member.region?.name}
                      placeOfBirth={member.birthPlace}
                      dateOfBirth={member.birthDate ? new Date(member.birthDate).toLocaleDateString('id-ID') : '-'}
                      address={member.address}
                      registeredAt={member.createdAt ? new Date(member.createdAt).toLocaleDateString('id-ID') : '-'}
                      status={member.user?.status}
                      photoUrl={member.photoUrl}
                    />
                  )}
               </div>
            </Card>

            <Card title="Audit Log Perjalanan" subtitle="Catatan mutasi administrasi pendekar">
               <div className="space-y-4 font-inter">
                  {loading ? (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="flex gap-3 text-[12px] p-3 rounded-md bg-gray-50 border border-gray-100">
                        <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-2 w-1/3" />
                        </div>
                      </div>
                    ))
                  ) : [
                    { title: 'Pendaftaran Akun', desc: 'Pendaftaran anggota disetujui', date: member.createdAt, icon: <UserCheck size={14} className="text-emerald-500" /> },
                    { title: 'Penerbitan E-KTA', desc: `ID ${member.ktaNumber || 'Menunggu'}`, date: member.ktaNumber ? member.updatedAt : '-', icon: <ShieldCheck size={14} className="text-blue-500" /> }
                  ].map((log, i) => (
                     <div key={i} className="flex gap-3 text-[12px] p-3 rounded-md bg-gray-50 border border-gray-100">
                        <div className="h-7 w-7 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-gray-100">
                           {log.icon}
                        </div>
                        <div className="flex-1 space-y-0.5 text-left min-w-0">
                           <p className="font-semibold text-gray-900 truncate">{log.title}</p>
                           <p className="text-[10.5px] text-gray-400 font-medium truncate">{log.desc}</p>
                           <span className="inline-block text-[9px] text-gray-400 font-mono mt-1">
                              {log.date && log.date !== '-' ? new Date(log.date).toLocaleString('id-ID') : '-'}
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>
         </div>

         <div className="lg:col-span-7 space-y-6">
            <Card title="Dokumen Persyaratan" subtitle="Berkas fisik pendukung keanggotaan">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {loading ? (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="p-4 rounded-md border border-gray-100 bg-gray-50 flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded shrink-0" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-3 w-3/4" />
                           <Skeleton className="h-2 w-1/4" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-4 rounded-md border border-gray-100 bg-gray-50 flex items-center justify-between group hover:border-[#DCAF01]/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-white flex items-center justify-center shadow-sm border border-gray-100">
                              <UserIcon size={20} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-gray-900 leading-tight">Pas Foto Resmi</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">TERSEDIA</p>
                            </div>
                        </div>
                        {member.photoUrl ? (
                            <a href={`${API_URL}${member.photoUrl}`} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#DCAF01] shadow-sm border border-gray-100 hover:scale-110 transition-transform">
                              <Eye size={14} />
                            </a>
                        ) : <span className="text-[10px] text-gray-300">Belum ada</span>}
                      </div>

                      <div className="p-4 rounded-md border border-gray-100 bg-gray-50 flex items-center justify-between group hover:border-[#DCAF01]/30 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-white flex items-center justify-center shadow-sm border border-gray-100">
                              <FileText size={20} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-gray-900 leading-tight">Surat Rekomendasi</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{member.documentUrl ? 'TERSEDIA' : 'TIDAK ADA'}</p>
                            </div>
                        </div>
                        {member.documentUrl ? (
                            <a href={`${API_URL}${member.documentUrl}`} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#DCAF01] shadow-sm border border-gray-100 hover:scale-110 transition-transform">
                              <Eye size={14} />
                            </a>
                        ) : <span className="text-[10px] text-gray-300 italic">Belum diunggah</span>}
                      </div>
                    </>
                  )}
               </div>
            </Card>

            <Card title="Informasi Personal Pendekar" subtitle="Identitas diri dasar yang terverifikasi">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-[13px]">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="flex flex-col text-left space-y-2">
                        <Skeleton className="h-2 w-1/4" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Nama Lengkap</span>
                        <span className="font-semibold text-gray-900 flex items-center gap-1.5 font-inter">
                            <User size={14} className="text-gray-400" /> {member.fullName}
                        </span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Nomor Identitas (NIK/Paspor)</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-gray-900 flex items-center gap-1.5">
                              <Hash size={14} className="text-gray-400" /> {maskNik(member.nik)}
                            </span>
                            <button 
                              onClick={() => setShowNik(!showNik)}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#DCAF01] transition-colors border-0 bg-transparent cursor-pointer"
                            >
                              {showNik ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Alamat Email</span>
                        <span className="font-semibold text-gray-800 flex items-center gap-1.5 font-inter truncate">
                            <Mail size={14} className="text-gray-400" /> {member.user?.email}
                        </span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Nomor WhatsApp</span>
                        <span className="font-semibold text-gray-800 flex items-center gap-1.5 font-inter font-mono">
                            <Phone size={14} className="text-gray-400" /> {member.phone || '-'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Tempat Lahir</span>
                            <span className="font-semibold text-gray-900 font-inter uppercase">{member.birthPlace || '-'}</span>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Tanggal Lahir</span>
                            <span className="font-semibold text-gray-900 font-inter flex items-center gap-1.5">
                              <Calendar size={14} className="text-gray-400" /> {member.birthDate ? new Date(member.birthDate).toLocaleDateString('id-ID') : '-'}
                            </span>
                        </div>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Jenis Kelamin</span>
                        <span className="font-semibold text-gray-800 font-inter">{member.gender || '-'}</span>
                      </div>
                    </>
                  )}
               </div>
            </Card>

            <Card title="Data Administrasi & Keanggotaan" subtitle="Rincian nomor identitas KTA dan penempatan cabang">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-[13px]">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="flex flex-col text-left space-y-2">
                        <Skeleton className="h-2 w-1/4" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Nomor E-KTA</span>
                        <span className="font-mono font-bold text-[#DCAF01] text-[13.5px] flex items-center gap-1.5">
                            <ShieldCheck size={14} /> {member.ktaNumber || 'BELUM TERBIT'}
                        </span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Tipe Anggota</span>
                        <span className="font-semibold text-gray-900 font-inter uppercase">{member.memberType?.replace('_', ' ') || 'Umum'}</span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Peran Sistem (Role)</span>
                        <span className="font-bold text-[#DCAF01] font-inter uppercase tracking-widest">{member.user?.role?.replace('_', ' ') || 'MEMBER'}</span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Wilayah Cabang</span>
                        <span className="font-semibold text-gray-900 flex items-center gap-1.5 font-inter">
                            <MapPin size={14} className="text-gray-400" /> {member.city || member.region?.name || '-'}
                        </span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Tanggal Bergabung</span>
                        <span className="font-semibold text-gray-900 font-inter flex items-center gap-1.5">
                            <Clock size={14} className="text-gray-400" /> {member.createdAt ? new Date(member.createdAt).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Status Akses</span>
                        <div className="inline-flex">
                            <Badge variant={member.user?.status === 'ACTIVE' ? 'success' : member.user?.status === 'PENDING' ? 'warning' : 'danger'}>
                              {member.user?.status === 'ACTIVE' ? 'Aktif' : member.user?.status === 'PENDING' ? 'Menunggu' : 'Nonaktif'}
                            </Badge>
                          </div>
                      </div>
                      <div className="flex flex-col text-left sm:col-span-2">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 font-inter">Alamat Lengkap Sesuai Domisili</span>
                        <span className="font-medium text-gray-600 leading-relaxed font-inter">{member.address || 'Alamat lengkap domisili belum diisi.'}</span>
                      </div>
                    </>
                  )}
               </div>
            </Card>

         </div>

      </div>

      <ConfirmModal 
        isOpen={isDeactivateOpen}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={() => {
          setIsDeactivateOpen(false);
          toggleStatus();
        }}
        title={member?.user?.status === 'ACTIVE' ? 'Nonaktifkan Akses Anggota?' : 'Aktifkan Akses Anggota?'}
        message={`Apakah Anda yakin ingin ${member?.user?.status === 'ACTIVE' ? 'menonaktifkan' : 'mengaktifkan'} hak akses login untuk pendekar ${member?.fullName}?`}
        variant={member?.user?.status === 'ACTIVE' ? 'danger' : 'primary'}
      />

    </div>
  );
};

export default MemberDetail;
