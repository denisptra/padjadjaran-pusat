import React, { useEffect, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { 
  Database, 
  Download, 
  Trash2, 
  Plus, 
  Clock, 
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import ConfirmationModal from '../../../components/ui/ConfirmModal';
import { cn } from '../../../utils/cn';
import { superAdminApi } from '../../../services/superAdminApi';

const BackupPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getBackup();
      setBackups(res.data);
    } catch (err) {
      toast.error('Gagal memuat data backup.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    toast.info('Memulai proses pencadangan data...');
    try {
      await superAdminApi.createBackup();
      toast.success('Pencadangan data berhasil diselesaikan.');
      fetchBackups();
    } catch (err) {
      toast.error('Gagal membuat backup.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = () => {
    toast.success(`File backup ${confirmDelete.filePath} telah dihapus.`);
    setConfirmDelete(null);
  };

  const columns = [
    { 
      key: 'filePath', 
      label: 'Nama File',
      render: (val: string) => (
        <div className="flex items-center gap-2">
           <FileText size={16} className="text-gray-400" />
           <span className="text-[13px] font-mono font-medium text-gray-900">{val}</span>
        </div>
      )
    },
    { 
      key: 'triggeredBy', 
      label: 'Oleh',
      render: (val: string) => <span className="text-[12px] font-medium">{val}</span>
    },
    { 
      key: 'createdAt', 
      label: 'Tanggal Backup',
      render: (val: string) => (
        <span className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
           <Clock size={12} /> {new Date(val).toLocaleString('id-ID')}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val: string) => (
        <Badge variant={val === 'Berhasil' ? 'success' : 'danger'} className="text-[9px] px-1.5 py-0 uppercase">
           {val}
        </Badge>
      )
    },
    { 
      key: 'actions', 
      label: 'Aksi',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
           <button 
             onClick={() => toast.success('Mengunduh file backup...')}
             className="p-1.5 hover:bg-gray-100 rounded text-blue-600 transition-colors border-0 bg-transparent cursor-pointer"
             title="Download"
           >
              <Download size={16} />
           </button>
           <button 
             onClick={() => setConfirmDelete(row)}
             className="p-1.5 hover:bg-gray-100 rounded text-red-500 transition-colors border-0 bg-transparent cursor-pointer"
             title="Hapus"
           >
              <Trash2 size={16} />
           </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Cadangan Data" 
        subtitle="Manajemen ekspor, pencadangan, dan pemulihan basis data sistem."
        action={
           <Button size="sm" onClick={handleGenerate} isLoading={isGenerating}>
              <RefreshCw size={16} className={cn("mr-2", isGenerating && "animate-spin")} /> Generate Backup Baru
           </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HardDrive size={24} />
               </div>
               <div className="text-left">
                  <p className="text-[12px] text-gray-500 font-semibold uppercase">Storage Terpakai</p>
                  <p className="text-[20px] font-semibold text-gray-900">0.4 GB / 5 GB</p>
               </div>
            </div>
         </Card>
         <Card>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock size={24} />
               </div>
               <div className="text-left">
                  <p className="text-[12px] text-gray-500 font-semibold uppercase">Backup Terakhir</p>
                  <p className="text-[16px] font-semibold text-gray-900">{backups.length > 0 ? new Date(backups[0].createdAt).toLocaleDateString('id-ID') : '-'}</p>
               </div>
            </div>
         </Card>
         <Card>
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Database size={24} />
               </div>
               <div className="text-left">
                  <p className="text-[12px] text-gray-500 font-semibold uppercase">Total Snapshot</p>
                  <p className="text-[20px] font-semibold text-gray-900">{backups.length} Files</p>
               </div>
            </div>
         </Card>
      </div>

      <Card title="Riwayat Snapshot Database" subtitle="Daftar file cadangan yang tersedia di server cloud storage.">
        {loading && backups.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <Loader2 size={40} className="animate-spin opacity-20" />
            <p className="font-medium animate-pulse">Memuat riwayat backup...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={backups} className="border-0 rounded-none" />
        )}
      </Card>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-md flex gap-3">
         <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
         <div className="text-left">
            <p className="text-[12px] text-amber-800 font-semibold uppercase tracking-wide mb-1">Peringatan Keamanan</p>
            <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
               File backup berisi data sensitif seluruh anggota nasional. Jangan sembarangan membagikan link download. Seluruh aktivitas unduhan backup tercatat dalam Audit Log Sistem.
            </p>
         </div>
      </div>

      <ConfirmationModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Hapus File Backup?"
        message={`File ${confirmDelete?.filePath} akan dihapus secara permanen dari server. Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
};

export default BackupPage;
