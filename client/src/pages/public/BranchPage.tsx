import { useState, useEffect, useMemo } from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import BranchCard from '../../components/public/BranchCard';
import Input from '../../components/ui/Input';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { GoogleIcon } from '../../components/ui/Icons';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import { publicApi } from '../../services/publicApi';

const ITEMS_PER_PAGE = 6;

export default function BranchPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [regionsRes, provincesRes] = await Promise.all([
          publicApi.getRegions(),
          publicApi.getProvinces()
        ]);
        
        const regionsData = Array.isArray(regionsRes.data) ? regionsRes.data : (regionsRes.data?.data || []);
        const list = regionsData.map((b: any) => {
          let city = b.name.replace(/Cabang|Padjadjaran/gi, '').trim() || 'Tasikmalaya';
          return {
            id: b.id,
            name: b.name,
            headName: b.admin?.profile?.fullName || 'Belum Ditentukan',
            address: b.address || 'Alamat belum diatur',
            city: city,
            province: b.province?.name || 'Luar Negeri',
            phone: b.admin?.profile?.phone || '-',
          };
        });
        setBranches(list);

        const provincesData = Array.isArray(provincesRes.data) ? provincesRes.data : (provincesRes.data?.data || []);
        const provinceNames = provincesData.map((p: any) => p.name);
        setProvinces(provinceNames);

      } catch (err) {
        console.error('Failed to fetch branch data', err);
        setBranches([]);
        setProvinces([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Improved search and filter logic
  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery = !query || 
        b.name.toLowerCase().includes(query) || 
        b.address.toLowerCase().includes(query) ||
        b.city.toLowerCase().includes(query) ||
        b.headName.toLowerCase().includes(query);
        
      const matchesProvince = !selectedProvince || b.province === selectedProvince;
      
      return matchesQuery && matchesProvince;
    });
  }, [branches, searchQuery, selectedProvince]);

  const totalPages = Math.ceil(filteredBranches.length / ITEMS_PER_PAGE);
  const displayedBranches = filteredBranches.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when search or filter changes
  }, [searchQuery, selectedProvince]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="min-h-screen flex flex-col justify-between font-inter text-stone-900">
      <div>
        <PublicNavbar />
        <main>
          <section
            className="bg-cover bg-center pt-44 pb-24 border-b border-[#E5E0D3] relative"
            style={{ backgroundImage: `linear-gradient(rgba(28, 24, 18, 0.75), rgba(28, 24, 18, 0.9)), url('https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=1200')` }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] text-[#C9A227] font-cinzel font-semibold mb-4 tracking-tight drop-shadow-md">Persebaran Perguruan</h1>
              <p className="text-[13px] text-white/85 max-w-[650px] mx-auto font-medium leading-relaxed font-inter">Persebaran resmi pusat pendidikan dan latihan Pencak Silat Padjadjaran di seluruh penjuru tanah air.</p>
            </div>
          </section>

          <section className="py-6 bg-white border-b border-stone-100 shadow-sm relative z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 justify-center items-center">
              <div className="relative w-full max-w-md">
                <Input
                  placeholder="Cari nama cabang, pimpinan, atau alamat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<GoogleIcon name="search" size={18} className="text-stone-400" />}
                />
              </div>
              <div className="w-full md:w-64">
                <SearchableSelect 
                  options={provinces}
                  value={selectedProvince}
                  onChange={setSelectedProvince}
                  placeholder="Semua Provinsi"
                />
              </div>
            </div>
          </section>

          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-[#E5E0D3]/60 rounded-xl p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  ))
                ) : displayedBranches.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-stone-400 text-[13px] italic">
                    <GoogleIcon name="search_off" size={48} className="mb-4 opacity-20" />
                    <p>Tidak ada cabang latihan yang ditemukan untuk "{searchQuery}"</p>
                  </div>
                ) : (
                  displayedBranches.map(b => <BranchCard key={b.id} branch={b} />)
                )}
              </div>

              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}

