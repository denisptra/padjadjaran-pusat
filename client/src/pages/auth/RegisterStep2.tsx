import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleIcon } from '../../components/ui/Icons';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ONBOARDING_STORAGE_KEY } from '../../constants/authStates';
import { regionApi } from '../../services/regionApi';

const RegisterProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    nationality: 'WNI',
    fullName: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    gender: '',
    phone: '',
    memberType: 'umum',
    provinceId: '',
    regionId: '',
    address: '',
  });

  const [provinces, setProvinces] = useState<{ id: string; name: string; isOverseas: boolean }[]>([]);
  const [regions, setRegions] = useState<{ id: string; name: string; provinceId: string }[]>([]);
  const [allRegions, setAllRegions] = useState<{ id: string; name: string; provinceId: string }[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [provRes, regRes] = await Promise.all([
          regionApi.getProvinces(),
          regionApi.getList() // Use public getList instead of admin-only getAll
        ]);
        
        const provData = provRes.data?.data || provRes.data || [];
        const regData = regRes.data?.data || regRes.data || [];
        
        setProvinces(Array.isArray(provData) ? provData : []);
        setAllRegions(Array.isArray(regData) ? regData : []);
      } catch (err) {
        console.error('Failed to fetch regions', err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!formData.provinceId) {
      setRegions([]);
      return;
    }
    const fetchRegions = async () => {
      try {
        const res = await regionApi.getList(formData.provinceId);
        const data = res.data?.data || res.data || [];
        setRegions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch regions for province', err);
      }
    };
    fetchRegions();
  }, [formData.provinceId]);

  useEffect(() => {
    const savedData = sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (savedData) {
      setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let newValue = value;
      
      if (name === 'nik') {
        if (prev.nationality === 'WNI') {
          newValue = value.replace(/\D/g, '').slice(0, 16);
        } else {
          newValue = value.slice(0, 30);
        }
      }
      
      if (name === 'phone') {
        let numericPhone = value.replace(/\D/g, '');
        if (numericPhone.startsWith('0')) {
          numericPhone = '62' + numericPhone.substring(1);
        } else if (!numericPhone.startsWith('62') && numericPhone.length > 0) {
          numericPhone = '62' + numericPhone;
        }
        newValue = numericPhone ? '+' + numericPhone : '';
      }

      const newData = { ...prev, [name]: newValue };
      
      if (name === 'provinceId') {
        newData.regionId = '';
      }

      if (name === 'nationality') {
        const luarNegeriProv = provinces.find(p => p.isOverseas || p.name === 'Luar Negeri');
        newData.provinceId = newValue === 'WNA' && luarNegeriProv ? luarNegeriProv.id : '';
        newData.regionId = '';
        newData.nik = '';
      }

      return newData;
    });

    if (error) clearError();
  };

  const isFormValid = () => {
    const baseValid = 
      formData.fullName.trim() !== '' &&
      formData.birthPlace.trim() !== '' &&
      formData.birthDate !== '' &&
      formData.gender !== '' &&
      formData.phone.length > 5 &&
      formData.memberType !== '' &&
      formData.address.trim() !== '';

    if (!baseValid) return false;

    if (formData.nationality === 'WNI') {
      return formData.nik.length === 16 && formData.provinceId !== '' && formData.regionId !== '';
    } else {
      return formData.nik.length > 3 && formData.regionId !== '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    try {
      await updateProfile(formData);
      navigate('/register/documents');
    } catch (err) {
      // Error handled by store
    }
  };

  const luarNegeriProv = provinces.find(p => p.isOverseas || p.name === 'Luar Negeri');
  const foreignRegions = luarNegeriProv
    ? allRegions.filter(r => r.provinceId === luarNegeriProv.id)
    : allRegions.filter(r => ['Malaysia', 'Singapore', 'Brunei', 'Thailand'].includes(r.name));

  return (
    <AuthLayout>
      <div className="space-y-8 animate-fade pb-12">
        <div className="space-y-3 text-center lg:text-left">
          <h1 className="font-cinzel text-3xl font-semibold leading-tight tracking-wide text-gray-900 ">
            Lengkapi Data Diri
          </h1>
          <div className="flex items-center justify-between gap-4 pt-2">
            <p className="text-[11px] font-medium text-primary  tracking-normal">Langkah 02 / 03</p>
            <span className="text-[11px] font-medium text-gray-400 italic">Biodata Diri</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: '67%' }} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-status-danger/5 border border-status-danger/10 text-status-danger rounded-md text-[13px] font-medium flex items-center gap-3 animate-fade shadow-sm">
              <GoogleIcon name="error_outline" size={18} strokeWidth={2.5} /> {error}
            </div>
          )}

          <div className="space-y-5 text-left">
            <p className="text-[13px] text-gray-600 font-medium ml-1">
              Email terverifikasi: <strong className="text-gray-900">{user?.email}</strong> <GoogleIcon name="check_circle" size={14} className="text-status-success inline align-middle ml-1" />
            </p>

            <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700 ml-1 block">Kewarganegaraan</label>
                <div className="flex gap-6 mt-1 ml-1">
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="nationality" 
                        value="WNI" 
                        checked={formData.nationality === 'WNI'}
                        onChange={handleChange}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-[13px] font-medium text-gray-700">WNI (Indonesia)</span>
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="nationality" 
                        value="WNA" 
                        checked={formData.nationality === 'WNA'}
                        onChange={handleChange}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-[13px] font-medium text-gray-700">WNA (Asing)</span>
                   </label>
                </div>
            </div>

            <Input
              label="Nama Lengkap *"
              name="fullName"
              placeholder="Sesuai Identitas Resmi"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  label={formData.nationality === 'WNI' ? "Nomor Induk Kependudukan *" : "Nomor Paspor/ Identitas Negara *"}
                  name="nik"
                  placeholder={formData.nationality === 'WNI' ? "16 digit angka" : "Masukkan nomor identitas"}
                  value={formData.nik}
                  onChange={handleChange}
                  required
                  maxLength={formData.nationality === 'WNI' ? 16 : 30}
                  className={formData.nationality === 'WNI' && formData.nik.length > 0 && formData.nik.length !== 16 ? "border-status-danger focus:ring-status-danger/20 focus:border-status-danger" : ""}
                />
                {formData.nationality === 'WNI' && formData.nik.length > 0 && formData.nik.length !== 16 && (
                  <p className="text-[11px] text-status-danger font-medium ml-1">NIK harus tepat 16 digit.</p>
                )}
              </div>
              <Input
                label="Nomor Telepon *"
                name="phone"
                placeholder="+6281234567xxx"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Tempat Lahir *"
                name="birthPlace"
                placeholder="Kota/Kab"
                value={formData.birthPlace}
                onChange={handleChange}
                required
              />
              <Input
                label="Tanggal Lahir *"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select 
                label="Jenis Kelamin *"
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                required
              >
                <option value="">Pilih...</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </Select>

              <Select 
                label="Tipe Anggota *"
                name="memberType" 
                value={formData.memberType} 
                onChange={handleChange}
                required
              >
                <option value="umum">Umum</option>
                <option value="khusus">Khusus</option>
                <option value="pencak_silat">Pencak Silat</option>
              </Select>
            </div>

            {formData.nationality === 'WNI' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select 
                  label="Provinsi Domisili *"
                  name="provinceId" 
                  value={formData.provinceId} 
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.filter(p => !p.isOverseas && p.name !== 'Pusat').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </Select>

                <Select 
                  label="Kota/Kabupaten *"
                  name="regionId" 
                  value={formData.regionId} 
                  onChange={handleChange}
                  required
                  disabled={!formData.provinceId}
                >
                  <option value="">Pilih Kota/Kab</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
              </div>
            ) : (
              <Select 
                label="Negara Domisili *"
                name="regionId" 
                value={formData.regionId} 
                onChange={handleChange}
                required
              >
                <option value="">Pilih Negara</option>
                {foreignRegions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            )}

            <Input
              as="textarea"
              label="Alamat Lengkap *"
              name="address" 
              value={formData.address} 
              onChange={handleChange}
              required
              rows={3}
              placeholder="Jalan, No. Rumah, RT/RW, dsb."
            />

          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 border-t border-gray-100 pt-8">
             <Button type="button" variant="white" size="md" onClick={() => navigate('/verify-otp')} className="sm:flex-1 font-semibold h-11 lg:h-10 text-[14px] lg:text-[13px]">
                Kembali
             </Button>
             <Button type="submit" size="md" disabled={isLoading || !isFormValid()} className="sm:flex-[2] font-semibold h-11 lg:h-10 text-[14px] lg:text-[13px] shadow-lg shadow-[#DCAF01]/10">
                Simpan & Lanjut
             </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterProfilePage;
