import React, { useEffect, useState } from 'react';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import StatCard from '../../../components/ui/StatCard';
import Modal from '../../../components/ui/Modal';
import ConfirmationModal from '../../../components/ui/ConfirmModal';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from '../../../stores/toastStore';
import { paymentApi } from '../../../services/paymentApi';
import { PaymentStatus, PaymentStatusLabels } from '../../../utils/enums';

interface PaymentRecord {
  id: string;
  fullName: string;
  email: string;
  ktaNumber: string;
  wilayahName: string;
  amount: number;
  status: PaymentStatus;
  confirmDate: string;
  proofUrl: string;
  notes?: string;
}

const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua Status');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [confirmVerify, setConfirmVerify] = useState<PaymentRecord | null>(null);
  const [rejectPayment, setRejectPayment] = useState<PaymentRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [addNotesPayment, setAddNotesPayment] = useState<PaymentRecord | null>(null);
  const [customNote, setCustomNote] = useState('');
  
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [searchTerm, filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentApi.getAll({
        search: searchTerm,
        status: filterStatus === 'Semua Status' ? '' : filterStatus
      });
      setPayments(res.data);
    } catch (err) {
      toast.error('Gagal memuat data pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyConfirm = async () => {
    if (!confirmVerify) return;
    try {
      await paymentApi.verify(confirmVerify.id);
      toast.success('Pembayaran berhasil diverifikasi.');
      fetchPayments();
      setConfirmVerify(null);
    } catch (err) {
      toast.error('Gagal memverifikasi pembayaran.');
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectPayment) return;
    if (!rejectReason.trim()) {
      toast.error('Catatan wajib diisi saat menolak pembayaran.');
      return;
    }
    try {
      await paymentApi.reject(rejectPayment.id, rejectReason);
      toast.success('Status berhasil diperbarui.');
      fetchPayments();
      setRejectPayment(null);
      setRejectReason('');
    } catch (err) {
      toast.error('Gagal menolak pembayaran.');
    }
  };

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === PaymentStatus.PENDING).length,
    verified: payments.filter(p => p.status === PaymentStatus.VERIFIED).length,
    rejected: payments.filter(p => p.status === PaymentStatus.REJECTED).length,
  };

  const columns = [
    {
      key: 'fullName',
      label: 'Nama Anggota',
      render: (_: any, row: any) => (
        <div className="text-left">
          <p className="font-semibold text-gray-900 leading-tight uppercase text-[12px]">{row.fullName}</p>
          <p className="text-[10px] text-gray-400 font-medium font-mono">{row.email}</p>
        </div>
      )
    },
    { key: 'ktaNumber', label: 'No. E-KTA' },
    { key: 'wilayahName', label: 'Wilayah' },
    { 
      key: 'amount', 
      label: 'Nominal',
      render: (val: number) => <span className="font-mono font-bold text-gray-900">Rp {val.toLocaleString()}</span>
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val: PaymentStatus) => (
        <Badge variant={val === PaymentStatus.VERIFIED ? 'success' : val === PaymentStatus.REJECTED ? 'danger' : 'warning'} className="uppercase">
          {PaymentStatusLabels[val] || val}
        </Badge>
      )
    },
    { key: 'confirmDate', label: 'Tgl Konfirmasi' },
    { 
      key: 'actions', 
      label: 'Aksi',
      render: (_: any, row: PaymentRecord) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setSelectedPayment(row)}
            className="p-1.5 hover:bg-gray-100 rounded text-blue-600 transition-colors border-0 bg-transparent cursor-pointer"
            title="Tinjau Bukti"
          >
            <Eye size={16} />
          </button>
          
          {row.status === PaymentStatus.PENDING && (
            <>
              <button 
                onClick={() => setConfirmVerify(row)}
                className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600 transition-colors border-0 bg-transparent cursor-pointer"
                title="Verifikasi Pembayaran"
              >
                <CheckCircle2 size={16} />
              </button>
              <button 
                onClick={() => { setRejectPayment(row); setRejectReason(''); }}
                className="p-1.5 hover:bg-red-50 rounded text-red-500 transition-colors border-0 bg-transparent cursor-pointer"
                title="Tolak Pembayaran"
              >
                <XCircle size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade pb-10 text-left">
      <PageHeader 
        title="Pembayaran Anggota" 
        subtitle="Verifikasi konfirmasi biaya pembuatan E-KTA dan registrasi anggota secara nasional."
      />

      {/* Indikator Pembayaran */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pembayaran" value={stats.total.toString()} icon={<CreditCard size={18} />} trend="up" description="+0 hari ini" />
        <StatCard title="Menunggu Verifikasi" value={stats.pending.toString()} icon={<Clock size={18} />} variant="warning" />
        <StatCard title="Terverifikasi" value={stats.verified.toString()} icon={<CheckCircle2 size={18} />} variant="success" />
        <StatCard title="Ditolak" value={stats.rejected.toString()} icon={<XCircle size={18} />} variant="danger" />
      </div>

      {/* TOOLBAR */}
      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center bg-gray-50/50 border-b border-gray-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Cari nama, No. E-KTA, atau wilayah..."
              className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-md text-[13px] outline-none focus:border-[#DCAF01] transition-all font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3 shrink-0 w-full md:w-auto">
            <Select 
              className="h-11 w-full md:w-64 shadow-sm font-semibold"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: 'Semua Status Konfirmasi', value: 'Semua Status' },
                { label: `Status: ${PaymentStatusLabels[PaymentStatus.PENDING]}`, value: PaymentStatus.PENDING },
                { label: `Status: ${PaymentStatusLabels[PaymentStatus.VERIFIED]}`, value: PaymentStatus.VERIFIED },
                { label: `Status: ${PaymentStatusLabels[PaymentStatus.REJECTED]}`, value: PaymentStatus.REJECTED },
              ]}
            />
          </div>
        </div>
        
        {loading && payments.length === 0 ? (
          <DataTable columns={columns} data={[]} isLoading={true} className="border-0 rounded-none shadow-sm" />
        ) : (
          <DataTable columns={columns} data={payments} className="border-0 rounded-none shadow-sm" />
        )}
      </Card>

      {/* DETAIL MODAL TINJAU */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Detail Pembayaran & Bukti Transfer"
        size="md"
        footer={
          <div className="flex justify-end gap-2 p-4 border-t border-gray-50">
            <Button variant="white" onClick={() => setSelectedPayment(null)} className="font-semibold border-gray-200">Tutup</Button>
            {selectedPayment?.status === PaymentStatus.PENDING && (
              <>
                <Button 
                  variant="white"
                  className="font-semibold border-red-100 text-red-600 hover:bg-red-50 uppercase text-[11px]"
                  onClick={() => { setRejectPayment(selectedPayment); setSelectedPayment(null); setRejectReason(''); }}
                >
                  Tolak Pembayaran
                </Button>
                <Button 
                  className="font-semibold px-8 uppercase bg-emerald-600 hover:bg-emerald-700 border-0"
                  onClick={() => { setConfirmVerify(selectedPayment); setSelectedPayment(null); }}
                >
                  Verifikasi Sekarang
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedPayment && (
          <div className="space-y-6 text-left p-2">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-[13px] border-b border-gray-100 pb-6">
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px] tracking-widest mb-1.5">Nama Anggota</p>
                <p className="font-bold text-gray-900 text-[15px] uppercase">{selectedPayment.fullName}</p>
                <p className="text-gray-500 font-medium">{selectedPayment.email}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px] tracking-widest mb-1.5">Nomor E-KTA</p>
                <p className="font-mono font-bold text-gray-900 text-[15px]">{selectedPayment.ktaNumber}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px] tracking-widest mb-1.5">Nominal Transfer</p>
                <p className="font-bold text-gray-900 text-[15px]">Rp {selectedPayment.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[10px] tracking-widest mb-1.5">Waktu Konfirmasi</p>
                <p className="text-gray-900 font-semibold">{selectedPayment.confirmDate}</p>
              </div>
            </div>

            {selectedPayment.notes && (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">Catatan Audit</p>
                <p className="text-[13px] text-gray-800 italic font-medium leading-relaxed">"{selectedPayment.notes}"</p>
              </div>
            )}

            <div>
              <p className="text-gray-400 font-semibold uppercase text-[10px] tracking-widest mb-3">Dokumen Bukti Transfer (E-Receipt)</p>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center min-h-[320px] relative group shadow-inner">
                {selectedPayment.proofUrl ? (
                  <img 
                    src={selectedPayment.proofUrl} 
                    alt="Bukti Transfer" 
                    className="max-h-full max-w-full object-contain p-4 hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-center space-y-2">
                     <AlertCircle size={40} className="mx-auto text-gray-300" />
                     <p className="text-[12px] font-medium text-gray-400">Bukti transfer tidak ditemukan atau gagal dimuat.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRMATION VERIFY */}
      <ConfirmationModal
        isOpen={!!confirmVerify}
        onClose={() => setConfirmVerify(null)}
        onConfirm={handleVerifyConfirm}
        title="Verifikasi Pembayaran Anggota?"
        message={`Anda akan menyetujui pembayaran registrasi dari "${confirmVerify?.fullName}" sebesar Rp ${confirmVerify?.amount.toLocaleString()}. Anggota akan segera mendapatkan akses penuh ke sistem.`}
        variant="primary"
        confirmLabel="Ya, Verifikasi"
      />

      {/* TOKO MODAL REJECT */}
      <Modal
        isOpen={!!rejectPayment}
        onClose={() => setRejectPayment(null)}
        title="Tolak Pembayaran Anggota"
        size="md"
        footer={
          <div className="flex justify-end gap-2 p-4 border-t border-gray-50">
            <Button variant="white" onClick={() => setRejectPayment(null)} className="font-semibold border-gray-200">BATALKAN</Button>
            <Button variant="danger" onClick={handleRejectSubmit} className="font-semibold px-8 uppercase border-0 bg-red-600 hover:bg-red-700">Tolak Pembayaran</Button>
          </div>
        }
      >
        {rejectPayment && (
          <form onSubmit={handleRejectSubmit} className="space-y-5 text-left p-2">
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3">
               <AlertCircle size={20} className="text-red-600 shrink-0" />
               <p className="text-[13px] text-red-800 font-medium leading-relaxed">
                 Apakah Anda yakin ingin menolak konfirmasi pembayaran dari <strong>{rejectPayment.fullName}</strong>? Berikan alasan yang jelas agar anggota dapat melakukan upload ulang.
               </p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-2 uppercase tracking-widest">Alasan Penolakan <span className="text-red-500">*</span></label>
              <textarea
                required
                className="w-full border-2 border-gray-100 rounded-xl p-4 text-[13px] outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50/50 min-h-[120px] font-medium shadow-inner"
                placeholder="Contoh: Bukti transfer tidak terbaca (buram), nominal tidak sesuai, atau rekening tujuan salah."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
