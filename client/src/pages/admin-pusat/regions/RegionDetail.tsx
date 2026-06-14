import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Skeleton from '../../../components/ui/Skeleton';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  User as UserIcon,
  ShieldCheck,
  Calendar,
  Phone,
  Edit,
  Trash2,
  ShieldAlert
} from 'lucide-react';
import { regionApi } from '../../../services/regionApi';
import { toast } from '../../../stores/toastStore';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const RegionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchRegion();
  }, [id]);

  const fetchRegion = async () => {
    try {
      setLoading(true);
      const res = await regionApi.getById(id!);
      
      // res.data (Axios) -> .data (Interceptor)
      const data = res.data?.data || res.data;
      setRegion(data);
    } catch (err) {
      toast.error('Gagal mengambil data wilayah');
      navigate('/app/admin-pusat/regions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await regionApi.remove(id!);
      toast.success('Wilayah berhasil dihapus');
      navigate('/app/admin-pusat/regions');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus wilayah');
    } finally {
      setConfirmDelete(false);
    }
  };

  if (!loading && !region) return null;

  return (
    <div className="space-y-6 animate-fade pb-10 text-left">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/app/admin-pusat/regions')} className="h-10 w-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm transition-all">
          <ArrowLeft size={20} />
        </button>
        <PageHeader 
          title={loading ? <Skeleton className="h-8 w-48" /> : region?.name} 
          subtitle={`Detail wilayah administratif operasional.`} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Informasi Utama" subtitle="Data administratif wilayah.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 text-left">
               <div className="space-y-1">
                 <p className="text-[11px] font-medium text-gray-400">Nama Wilayah / Negara</p>
                 {loading ? <Skeleton className="h-6 w-32" /> : <p className="text-[15px] font-semibold text-gray-950">{region?.name}</p>}
               </div>
               <div className="space-y-1">
                 <p className="text-[11px] font-medium text-gray-400">Status Operasional</p>
                 {loading ? <Skeleton className="h-6 w-20" /> : <Badge variant={region?.isActive ? 'success' : 'danger'}>{region?.isActive ? 'Aktif' : 'Non-aktif'}</Badge>}
               </div>
               <div className="space-y-1">
                 <p className="text-[11px] font-medium text-gray-400">Ketua / Pimpinan Wilayah</p>
                 {loading ? <Skeleton className="h-6 w-32" /> : <p className="text-[14px] font-medium text-gray-900">{region?.leaderName || '-'}</p>}
               </div>
               <div className="space-y-1">
                 <p className="text-[11px] font-medium text-gray-400">Kontak Wilayah (WhatsApp)</p>
                 {loading ? <Skeleton className="h-6 w-32" /> : <p className="text-[14px] font-medium text-gray-900">{region?.phone || '-'}</p>}
               </div>
               <div className="space-y-1">
                 <p className="text-[11px] font-medium text-gray-400">Total Anggota</p>
                 {loading ? <Skeleton className="h-6 w-24" /> : <p className="text-[14px] font-medium text-gray-900">{region?._count?.members || 0} Anggota</p>}
               </div>
            </div>

            {!loading && region?.description && (
              <div className="mt-6 pt-6 border-t border-gray-100 text-left">
                <p className="text-[11px] font-medium text-gray-400 mb-1.5">Deskripsi Wilayah</p>
                <p className="text-[13px] text-gray-600 leading-relaxed font-normal whitespace-pre-wrap">{region.description}</p>
              </div>
            )}

            {!loading && region?.address && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-left">
                <p className="text-[11px] font-medium text-gray-400 mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Alamat Kantor / Sekretariat</p>
                <p className="text-[13px] text-gray-600 leading-relaxed font-normal whitespace-pre-wrap">{region.address}</p>
              </div>
            )}
          </Card>

          <Card title="Admin Wilayah Terdaftar" subtitle="Pejabat otoritas wilayah saat ini.">
             {loading ? (
               <div className="flex items-start gap-6">
                  <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                  <div className="space-y-3 flex-1">
                     <Skeleton className="h-5 w-1/2" />
                     <Skeleton className="h-3 w-1/3" />
                     <div className="flex gap-4">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-32" />
                     </div>
                  </div>
               </div>
             ) : region?.admin ? (
               <div className="flex items-start gap-6">
                  <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border-2 border-gray-50 shadow-inner shrink-0">
                     {region.admin.profile?.photoUrl ? <img src={region.admin.profile.photoUrl} className="h-full w-full object-cover" /> : <UserIcon size={32} />}
                  </div>
                  <div className="space-y-3 flex-1 text-left">
                     <div>
                        <p className="text-[15px] font-medium text-gray-900">{region.admin.profile?.fullName || 'Nama tidak tersedia'}</p>
                        <p className="text-[12px] font-medium text-blue-600">{region.admin.email}</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                           <Phone size={14} className="text-[#DCAF01]" /> {region.admin.profile?.phone || '-'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                           <Calendar size={14} className="text-[#DCAF01]" /> Menjabat sejak {new Date(region.updatedAt).toLocaleDateString()}
                        </div>
                     </div>
                     <Button size="xs" variant="white" className="mt-2 border-blue-100 text-blue-600 hover:bg-blue-50" onClick={() => navigate(`/app/admin-pusat/members/${region.admin.profile?.id}`)}>Lihat Profil Lengkap</Button>
                  </div>
               </div>
             ) : (
               <div className="p-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <ShieldAlert size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-[14px] font-medium text-gray-500">Wilayah belum memiliki admin</p>
                  <p className="text-[12px] text-gray-400 mb-4 font-normal">Harap segera tetapkan admin wilayah untuk mengelola operasional daerah ini.</p>
                  <Button size="sm" onClick={() => navigate(`/app/admin-pusat/regions/${region?.id}/edit`)}>Tetapkan Admin Sekarang</Button>
               </div>
             )}
          </Card>
        </div>

        <div className="space-y-6">
           <Card title="Aksi Cepat" subtitle="Tindakan administratif wilayah.">
              <div className="space-y-3">
                 <Button className="w-full h-12 font-medium text-[12px]" icon={<Edit size={16} />} onClick={() => navigate(`/app/admin-pusat/regions/${region?.id}/edit`)}>Edit Konfigurasi</Button>
                 <Button variant="white" className="w-full h-12 font-medium text-[12px] border-red-100 text-red-600 hover:bg-red-50" icon={<Trash2 size={16} />} onClick={() => setConfirmDelete(true)}>Hapus Wilayah</Button>
              </div>
           </Card>

           <div className="p-5 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
              <ShieldCheck className="text-blue-500 shrink-0" size={24} />
              <div className="space-y-1">
                 <p className="text-[13px] font-medium text-blue-900">Otoritas Wilayah</p>
                 <p className="text-[12px] text-blue-700 font-normal leading-relaxed">Admin wilayah terpilih akan mendapatkan hak akses penuh untuk melakukan verifikasi pendaftaran di daerah {loading ? '...' : region?.name}.</p>
              </div>
           </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Hapus wilayah permanen?"
        message={`Apakah anda yakin ingin menghapus "${region?.name}"? Menghapus wilayah yang memiliki anggota terdaftar akan menyebabkan inkonsistensi data.`}
        confirmLabel="Ya, saya paham"
        variant="danger"
      />
    </div>
  );
};

export default RegionDetail;
