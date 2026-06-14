import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { User, Phone, MapPin, Save } from 'lucide-react';

interface ProfileFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Nama Lengkap" 
          value={formData.fullName} 
          onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
          icon={<User size={16} />} 
        />
        <Input 
          label="Nomor WhatsApp" 
          value={formData.phone} 
          onChange={(e) => setFormData({...formData, phone: e.target.value})} 
          icon={<Phone size={16} />} 
        />
      </div>
      <Input 
        label="Alamat Lengkap" 
        as="textarea" 
        value={formData.address} 
        onChange={(e) => setFormData({...formData, address: e.target.value})} 
        icon={<MapPin size={16} />} 
        rows={3} 
      />
      <div className="flex justify-end">
        <Button type="submit" isLoading={isLoading} className="px-10">
          <Save size={18} className="mr-2" /> Simpan Perubahan
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
