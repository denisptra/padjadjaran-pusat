import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fade">
      <div className="relative mb-8">
        <h1 className="text-[120px] font-bold text-gray-100 leading-none select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[24px] font-semibold text-gray-900 bg-white px-4">Halaman Tidak Ditemukan</span>
        </div>
      </div>
      
      <p className="text-gray-500 max-w-md mb-10 leading-relaxed text-[15px]">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan ke alamat lain.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="outline" onClick={() => navigate(-1)} className="px-8 border-gray-200">
          <ArrowLeft size={18} className="mr-2" /> Kembali
        </Button>
        <Button onClick={() => navigate('/')} className="px-8 shadow-lg shadow-[#DCAF01]/10">
          <Home size={18} className="mr-2" /> Beranda
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
