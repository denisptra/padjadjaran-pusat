import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Key, Shield, Eye, EyeOff, Save } from 'lucide-react';

interface PasswordFormProps {
  onSubmit: (data: any) => Promise<void>;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(passData);
      setPassData({ old: '', new: '', confirm: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <Input 
          label="Kata Sandi Saat Ini" 
          type={showPass.old ? 'text' : 'password'}
          value={passData.old}
          onChange={(e) => setPassData({...passData, old: e.target.value})}
          icon={<Key size={16} />}
        />
        <button 
          type="button" 
          onClick={() => setShowPass({...showPass, old: !showPass.old})}
          className="absolute right-3 top-[32px] p-2 text-gray-400 border-0 bg-transparent cursor-pointer"
        >
          {showPass.old ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="relative">
        <Input 
          label="Kata Sandi Baru" 
          type={showPass.new ? 'text' : 'password'}
          value={passData.new}
          onChange={(e) => setPassData({...passData, new: e.target.value})}
          icon={<Shield size={16} />}
          helper="Minimal 8 karakter unik."
        />
        <button 
          type="button" 
          onClick={() => setShowPass({...showPass, new: !showPass.new})}
          className="absolute right-3 top-[32px] p-2 text-gray-400 border-0 bg-transparent cursor-pointer"
        >
          {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="relative">
        <Input 
          label="Konfirmasi Kata Sandi Baru" 
          type={showPass.confirm ? 'text' : 'password'}
          value={passData.confirm}
          onChange={(e) => setPassData({...passData, confirm: e.target.value})}
          icon={<Shield size={16} />}
        />
        <button 
          type="button" 
          onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
          className="absolute right-3 top-[32px] p-2 text-gray-400 border-0 bg-transparent cursor-pointer"
        >
          {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <Button type="submit" isLoading={loading} className="px-10">
          <Save size={18} className="mr-2" /> Simpan Kata Sandi
        </Button>
      </div>
    </form>
  );
};

export default PasswordForm;
