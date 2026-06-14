import React, { useState } from 'react';
import { ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import api, { API_URL } from '../../services/api';
import { toast } from '../../stores/toastStore';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  maxSizeMB?: number;
  aspectHint?: string;
}

const compressImage = (file: File, maxSizeMB: number, maxWidthOrHeight = 1920): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = Math.round((height *= maxWidthOrHeight / width));
            width = maxWidthOrHeight;
          } else {
            width = Math.round((width *= maxWidthOrHeight / height));
            height = maxWidthOrHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);
        
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            
            if (compressedFile.size > file.size && file.size < maxSizeMB * 1024 * 1024) {
               resolve(file);
            } else {
               resolve(compressedFile);
            }
          },
          'image/webp',
          0.8
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Gambar',
  hint = 'Otomatis di-compress (Max HD)',
  maxSizeMB = 5,
  aspectHint,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const displayUrl = value
    ? (value.startsWith('http') ? value : `${API_URL}${value}`)
    : null;

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Format file harus gambar (JPG/PNG/WebP).');
      return;
    }

    setUploading(true);

    try {
      const processedFile = await compressImage(file, maxSizeMB);
      
      if (processedFile.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Ukuran file setelah kompresi masih melebihi ${maxSizeMB}MB.`);
        setUploading(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(processedFile);

      const formData = new FormData();
      formData.append('file', processedFile);
      const res = await api.post('/files/upload-secure', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.storagePath);
      toast.success('Gambar berhasil diunggah!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengunggah gambar.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    onChange('');
    setPreview(null);
  };

  const currentImage = preview || displayUrl;

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[13px] font-semibold text-gray-700 block">
          {label}
          {aspectHint && <span className="text-gray-400 font-normal ml-2">({aspectHint})</span>}
        </label>
      )}

      {currentImage ? (
        <div className="relative group rounded-md overflow-hidden border border-gray-200 bg-gray-100 shadow-sm">
          <img
            src={currentImage}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="flex items-center gap-2 bg-white text-gray-900 text-[12px] font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors shadow">
              <Upload size={14} />
              Ganti Gambar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-2 bg-red-500 text-white text-[12px] font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-red-600 transition-colors shadow border-0"
            >
              <X size={14} />
              Hapus
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-[#DCAF01]" />
            </div>
          )}
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center h-44 w-full border-2 border-dashed border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 hover:border-[#DCAF01]/50 transition-all cursor-pointer group"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {uploading ? (
            <>
              <Loader2 size={32} className="animate-spin text-[#DCAF01] mb-2" />
              <p className="text-[12px] font-semibold text-gray-500">Mengunggah gambar...</p>
            </>
          ) : (
            <>
              <div className="h-14 w-14 rounded-md bg-[#DCAF01]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ImageIcon size={26} className="text-[#DCAF01]" />
              </div>
              <p className="text-[13px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                Klik atau seret gambar ke sini
              </p>
              <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
            </>
          )}
        </label>
      )}
    </div>
  );
};

export default ImageUpload;

