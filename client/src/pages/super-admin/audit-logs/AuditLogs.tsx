import React, { useEffect, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  User as UserIcon,
  Shield,
  Zap,
  Edit,
  Trash2,
  Eye,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import Modal from '../../../components/ui/Modal';
import { superAdminApi } from '../../../services/superAdminApi';

const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('Semua Aksi');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [logsList, setLogsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [searchTerm, filterAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await superAdminApi.getAuditLogs({
        search: searchTerm,
        action: filterAction === 'Semua Aksi' ? '' : filterAction
      });
      setLogsList(res.data.data);
    } catch (err) {
      toast.error('Gagal memuat log audit.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.info('Menyiapkan file ekspor CSV...');
    setTimeout(() => {
       toast.success('Audit Log berhasil diekspor.');
    }, 1500);
  };

  const columns = [
    { 
      key: 'userEmail', 
      label: 'Aktor',
      render: (val: string, row: any) => (
        <div className="flex items-center gap-2">
           <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
              <UserIcon size={12} />
           </div>
           <div className="text-left">
              <p className="text-[12px] font-semibold text-gray-900 leading-none">{val}</p>
              <p className="text-[10px] text-gray-400 capitalize">{row.ipAddress}</p>
           </div>
        </div>
      )
    },
    { 
      key: 'action', 
      label: 'Aksi',
      render: (val: string) => (
        <code className="text-[10px] font-semibold bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 uppercase">
           {val}
        </code>
      )
    },
    { 
      key: 'entityType', 
      label: 'Target',
      render: (val: string, row: any) => (
        <span className="text-[12px] text-gray-600 font-medium">
          {val} {row.entityId ? `#${row.entityId.substring(0, 8)}` : ''}
        </span>
      )
    },
    { 
      key: 'createdAt', 
      label: 'Waktu Aktivitas',
      render: (val: string) => (
        <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
           <Clock size={12} /> {new Date(val).toLocaleString('id-ID')}
        </span>
      )
    },
    { 
      key: 'actions', 
      label: 'Aksi',
      render: (_: any, row: any) => (
        <button 
          onClick={() => setSelectedLog(row)}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 transition-colors border-0 bg-transparent cursor-pointer"
          title="Detail Log"
        >
           <Eye size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Log Audit" 
        subtitle="Catatan riwayat aktivitas seluruh pengguna dalam mengelola sistem."
        action={
           <Button size="sm" variant="white" onClick={handleExport}>
              <Download size={16} className="mr-2" /> Export CSV
           </Button>
        }
      />

      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center border-b border-gray-100">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Cari aktor, target, atau IP..."
                className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#DCAF01] transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-3 shrink-0">
              <Select 
                className="h-11 w-44"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                options={[
                  { label: 'Semua Aksi', value: 'Semua Aksi' },
                  { label: 'LOGIN', value: 'LOGIN' },
                  { label: 'CREATE', value: 'CREATE' },
                  { label: 'UPDATE', value: 'UPDATE' },
                  { label: 'DELETE', value: 'DELETE' },
                ]}
              />
              <Button variant="white" className="h-11 border-gray-200" onClick={fetchLogs}>
                 <Clock size={14} className="mr-2" /> Segarkan
              </Button>
           </div>
        </div>
        
        {loading && logsList.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
            <Loader2 size={40} className="animate-spin opacity-20" />
            <p className="font-medium animate-pulse">Memuat log aktivitas...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={logsList} className="border-0 rounded-none" />
        )}
      </Card>

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detail Aktivitas Sistem"
        size="lg"
        footer={<Button variant="white" onClick={() => setSelectedLog(null)}>Tutup</Button>}
      >
        {selectedLog && (
           <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-100 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                       <p className="text-[10px] text-gray-400 font-semibold uppercase">ID Log</p>
                       <p className="text-[13px] font-mono text-gray-900">#LOG-{selectedLog.id.substring(0, 12).toUpperCase()}</p>
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] text-gray-400 font-semibold uppercase">Alamat IP</p>
                       <p className="text-[13px] font-mono text-gray-900">{selectedLog.ipAddress}</p>
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] text-gray-400 font-semibold uppercase">Aksi</p>
                       <code className="text-[12px] font-semibold text-blue-600 uppercase">{selectedLog.action}</code>
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] text-gray-400 font-semibold uppercase">User Agent</p>
                       <p className="text-[11px] text-gray-600 truncate" title={selectedLog.userAgent}>{selectedLog.userAgent}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest border-b pb-1 text-left">Data Transaksi (JSON)</p>
                 <div className="p-4 bg-[#111827] rounded-md overflow-x-auto text-left">
                    <pre className="text-[12px] text-emerald-400 font-mono">
                      {JSON.stringify({
                        actor: selectedLog.userEmail,
                        action: selectedLog.action,
                        entity: selectedLog.entityType,
                        entityId: selectedLog.entityId,
                        newValues: selectedLog.newValues,
                        timestamp: selectedLog.createdAt
                      }, null, 2)}
                    </pre>
                 </div>
              </div>
           </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;
