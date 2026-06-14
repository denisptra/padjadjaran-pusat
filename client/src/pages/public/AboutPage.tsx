import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Skeleton from '../../components/ui/Skeleton';
import { publicApi } from '../../services/publicApi';
import { getSecureFileUrl } from '../../services/api';
import LogoPencakSilat from '../../assets/images/logo-pencaksilat.svg';
import Padepokan from '../../assets/images/padepokan.jpeg'

const GB1 = 'https://via.placeholder.com/400x500?text=GURU+BESAR';

const tabs = [
  { id: 'sejarah', label: 'Sejarah Singkat' },
  { id: 'visi-misi', label: 'Visi & Misi' },
  { id: 'logo', label: 'Filosofi Logo' }
];

const logoElements = [
  { title: 'Bentuk Bulat', desc: 'Tekad Bulat' },
  { title: 'Berdasar Kuning', desc: 'Johar Awal atau Awal Kehidupan' },
  { title: 'Bertepi Hitam', desc: 'Kekal dan Abadi' },
  { title: 'Tulisan dan Corak Hitam', desc: 'Kedewasaan Manusia sebagai Insan' },
  { title: 'Gambar Kepala Macan', desc: 'Pemimpin atau Khalifah' },
  { title: 'Kujang Sepasang', desc: '2 Kalimat Syahadat' },
  { title: 'Bintang Lima', desc: 'Rukun Islam' },
  { title: 'Tulisan Sunda', desc: 'Sunda Wiwitan' },
  { title: 'Tulisan Padjadjaran', desc: 'Pangjeujeh ajaran-ajaran / Petunjuk Ajaran-ajaran' }
];

const misiList = [
  'Menanamkan tekad Keimanan sebagai bentuk Syiar Agama Islam',
  'Mengembangkan Seni dan budaya secara berkesinambungan ke generasi Muda sebagai bentuk Syiar Budaya.',
  'Menjadikan sebagai riset kebudayaan nasional and edukasi seni budaya.',
  'Menyelenggarakan seni dan kebudayaan berkearifan lokal dan berwawasan global sebagai identitas jati diri bangsa.',
  'Mengembangkan nilai pariwisata yang berbasis budaya.',
  'Menjalin kerjasama dengan berbagai pihak yang terkait dalam pengembangan riset, kajian, serta pemikiran kebudayaan baik di tingkat regional, nasional, and internasional'
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('sejarah');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isLoading, setIsLoading] = useState(true);
  const [guruBesarList, setGuruBesarList] = useState<any[]>([]);

  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        setIsLoading(true);
        const res = await publicApi.getGuruBesar();
        const payload = res.data.data || res.data;
        
        const activeList = (payload || [])
          .map((item: any) => ({
            name: item.name,
            field: item.title || 'Guru Besar',
            image: getSecureFileUrl(item.imageUrl) || item.imageUrl || GB1,
            desc: item.description || '',
          }));
          
        setGuruBesarList(activeList);
      } catch (err) {
        console.error('Failed to fetch guru besar', err);
        setGuruBesarList([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCmsData();
  }, []);

  const updateWidth = () => {
    setWindowWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener('resize', updateWidth);
    updateWidth();
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const itemsPerView = windowWidth >= 1200 ? 4 : windowWidth >= 992 ? 3 : windowWidth >= 640 ? 2 : 1;
  const maxSlideIndex = Math.max(0, guruBesarList.length - itemsPerView);

  const nextGuru = () => {
    setCurrentSlide((prev) => (prev < maxSlideIndex ? prev + 1 : 0));
  };

  const prevGuru = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : maxSlideIndex));
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between font-inter">
      <div>
        <PublicNavbar />
        <main>
          {/* Hero Banner - 100% Template Replica */}
          <section
            className="bg-cover bg-center pt-44 pb-24 border-b-2 border-[#C9A227]/20 relative"
            style={{
              backgroundImage: `linear-gradient(rgba(28, 24, 18, 0.75), rgba(28, 24, 18, 0.9)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200')`,
            }}
          >
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] text-[#C9A227] font-cinzel font-semibold mb-4 tracking-tight drop-shadow-md">
                Tentang Kami
              </h1>
              <p className="text-[13px] text-white/85 max-w-[650px] mx-auto font-medium leading-relaxed font-inter">
                Mengenal Visi Misi, Sejarah, Filosofi Logo, dan Deretan Guru Besar Perguruan Pencak Silat Padjadjaran.
              </p>
            </div>
          </section>

          {/* Main Content Layout - 100% Template Replica with adjusted sticky menu */}
          <section className="py-16 md:py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">
              
              {/* Left Sidebar Selector - Sticky & Higher Up as requested */}
              <div className="w-full lg:sticky lg:top-16 lg:-mt-36 select-none z-20">
                <div className="hidden lg:block mb-3 px-1.5 lg:px-3">
                  <span className="text-[12px] text-stone-400 font-normal tracking-[0.15em]">
                    Menu Profil
                  </span>
                </div>
                <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-1">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center justify-center lg:justify-start h-10 px-1.5 lg:px-3 text-left font-normal text-[12px] tracking-wider transition-all duration-300 border-b-2 lg:border-b-0 lg:border-l-2 cursor-pointer bg-transparent select-none
                          ${isActive 
                            ? 'border-[#C9A227] text-[#C9A227] font-normal' 
                            : 'border-transparent text-stone-500 hover:text-[#111111]'
                          }`}
                      >
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Area: Switchable Dynamic Content */}
              <div className="w-full min-h-[400px]">
                {isLoading ? (
                  <div className="space-y-6">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : (
                  <div className="animate-fadeIn">
                    {activeTab === 'sejarah' && (
                      <div className="flex flex-col lg:flex-row gap-12 items-stretch">
                        <div className="flex flex-col gap-5 flex-grow">
                          <span className="text-[#C9A227]  font-normal text-[12px] tracking-[0.15em] flex items-center gap-2 before:content-[''] before:inline-block before:w-6 before:h-[2px] before:bg-[#C9A227]">
                            Sejarah Singkat
                          </span>
                          <h2 className="text-xl md:text-2xl lg:text-3xl font-cinzel font-semibold leading-snug text-neutral-900 mb-1  tracking-wide text-left">
                            Sejarah Singkat Padjadjaran
                          </h2>
                          <div className="space-y-4 text-[13px] text-stone-600 leading-[1.8] font-normal text-justify">
                            <p>
                              Didirikan pada 30 Januari 1970 di Tasikmalaya, Padepokan Pesantren Perguruan Pencak Silat Padjadjaran Pusat membawa warisan historis Kerajaan Padjadjaran dengan makna filosofis sebagai Pangjejeh Agama.
                            </p>
                            <p>
                              Melalui integrasi budaya and bela diri, kami bertujuan menumbuhkan rasa bangga dan harga diri bangsa demi menunjang pembangunan daerah serta melestarikan warisan leluhur bagi masa depan.
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 w-full lg:w-[420px] aspect-[4/3] lg:h-auto overflow-hidden shadow-lg rounded-lg border border-stone-100 bg-stone-50">
                          <img 
                            src={Padepokan} 
                            alt="Latihan Silat" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'visi-misi' && (
                      <div className="flex flex-col gap-10 text-left">
                        <div className="flex flex-col gap-4">
                          <span className="text-[#C9A227]  font-normal text-[12px] tracking-[0.15em] flex items-center gap-2 before:content-[''] before:inline-block before:w-6 before:h-[2px] before:bg-[#C9A227]">
                            Visi
                          </span>
                          <h2 className="text-xl md:text-2xl lg:text-3xl font-cinzel font-semibold leading-snug text-neutral-900 mb-1  tracking-wide">
                            Visi Perguruan Padjadjaran
                          </h2>
                          <div className="py-4 border-b border-stone-100">
                            <p className="text-[13px] text-stone-600 leading-[1.8] font-normal italic">
                              "Menjadikan Padepokan Pencak Silat Padjadjaran sebagai pusat unggulan dalam melestarikan dan mengembangkan seni bela diri pencak silat agar menjadi kebanggaan dan identitas bangsa Indonesia."
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          <span className="text-[#C9A227]  font-normal text-[12px] tracking-[0.15em] flex items-center gap-2 before:content-[''] before:inline-block before:w-6 before:h-[2px] before:bg-[#C9A227]">
                            Misi
                          </span>
                          <h2 className="text-xl md:text-2xl lg:text-3xl font-cinzel font-semibold leading-snug text-neutral-900 mb-1  tracking-wide">
                            Misi Perguruan Padjadjaran
                          </h2>
                          <div className="flex flex-col divide-y divide-stone-100">
                            {misiList.map((misi, idx) => (
                              <div 
                                key={idx} 
                                className="py-4 flex gap-4 items-start"
                              >
                                <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227] shrink-0 font-normal text-[13px]">
                                  {idx + 1}
                                </div>
                                <p className="text-[13px] text-stone-600 leading-[1.8] font-normal">{misi}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'logo' && (
                      <div className="flex flex-col gap-8 text-left">
                        <div className="flex flex-col gap-2">
                          <span className="text-[#C9A227]  font-normal text-[12px] tracking-[0.15em] flex items-center gap-2 before:content-[''] before:inline-block before:w-6 before:h-[2px] before:bg-[#C9A227]">
                            Filosofi Logo
                          </span>
                          <h2 className="text-xl md:text-2xl lg:text-3xl font-cinzel font-semibold leading-snug text-neutral-900  tracking-wide">
                            Makna Lambang Kebanggaan
                          </h2>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 items-center bg-[#F8F8F8] p-6 border border-stone-200 rounded-md">
                          <div className="shrink-0 w-full max-w-[240px] h-[240px] bg-white rounded-full border border-[#C9A227]/30 rounded-md flex items-center justify-center p-8 shadow-sm">
                            <img 
                              src={LogoPencakSilat}
                              alt="Logo Padjadjaran" 
                              className="w-full h-full object-contain" 
                            />
                          </div>
                          <div className="flex flex-col gap-3 flex-grow text-stone-600 font-inter">
                            <h3 className="font-cinzel text-[13px] font-semibold text-neutral-950 ">
                              Logo Perguruan Pencak Silat Padjadjaran
                            </h3>
                            <p className="text-[13px] leading-[1.8] font-normal">
                              Lambang Padepokan berbentuk lingkaran yang didalamnya terdapat simbol-simbol luhur yang mewakili ketauhidan, kepemimpinan, dan keberanian pendekar.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                          {logoElements.map((elem, idx) => (
                            <div 
                              key={idx} 
                              className="py-2 flex gap-4 items-start"
                            >
                              <div className="w-8 h-8 rounded-full bg-[#C9A227]/10 flex items-center justify-center text-[#C9A227] shrink-0 font-normal text-[12px] font-inter">
                                {idx + 1}
                              </div>
                              <div className="flex flex-col gap-1">
                                <h4 className="font-cinzel text-[13px] font-semibold text-neutral-950 leading-tight  tracking-wide">
                                  {elem.title}
                                </h4>
                                <p className="text-[13px] text-stone-500 leading-[1.8] font-normal font-inter">
                                  {elem.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Permanent Section: Deretan Guru Besar Section - Improved Cool Slider (Non-circular) */}
          <section className="py-16 md:py-24 border-t border-[#E5E0D3] bg-stone-50/30 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-[#C9A227]  font-normal text-[12px] tracking-[0.15em] flex items-center gap-2 justify-center before:content-[''] before:inline-block before:w-6 before:h-[2px] before:bg-[#C9A227]">
                  Pembina Utama
                </span>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-cinzel font-semibold leading-snug text-neutral-900 mb-2 mt-2">
                  Deretan Guru Besar
                </h2>
                <p className="text-[12px] text-stone-500 leading-[1.8] font-normal font-inter">
                  Tokoh pelestari, pendidik karakter, dan ilmuwan bela diri utama Perguruan Padjadjaran Pusat.
                </p>
              </div>

              {isLoading ? (
                <div className="flex gap-6 overflow-hidden">
                   {[1, 2, 3].map((n) => (
                     <div key={n} className="flex-1 min-w-[300px] border border-[#E5E0D3] rounded-lg p-6 space-y-4">
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                     </div>
                   ))}
                </div>
              ) : guruBesarList.length === 0 ? (
                <div className="text-center py-12 text-stone-400 italic">Belum ada data Guru Besar yang diterbitkan.</div>
              ) : (
                <div className="relative px-4 md:px-6 py-2">
                  <div className="overflow-hidden w-full py-4">
                    <motion.div 
                      className="flex"
                      animate={{ x: `-${currentSlide * (100 / itemsPerView)}%` }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      {guruBesarList.map((guru, idx) => (
                        <div 
                          key={idx}
                          className="shrink-0 px-3 flex flex-col"
                          style={{ width: `${100 / itemsPerView}%` }}
                        >
                          <div className="group relative bg-white border border-stone-200/80 p-4 shadow-sm hover:shadow-lg flex flex-col hover:border-[#C9A227]/40 transition-all duration-500 rounded-3xl h-full text-left">
                            {/* Profile Image */}
                            <div className="relative w-full aspect-square overflow-hidden bg-stone-100 rounded-2xl shrink-0">
                              <img 
                                src={guru.image} 
                                alt={guru.name} 
                                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" 
                              />
                            </div>
                            
                            {/* Info segment */}
                            <div className="pt-4 flex flex-col flex-grow text-left">
                              <h3 className="font-cinzel text-[15px] font-bold text-stone-900 leading-snug mb-1 group-hover:text-[#C9A227] transition-colors duration-300">
                                {guru.name}
                              </h3>
                              <p className="font-inter text-[12px] font-medium text-stone-400">
                                {guru.field}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Custom Styled Navigation */}
                  <button 
                    onClick={prevGuru}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-[#C9A227] hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-90 shadow-sm"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextGuru}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-500 hover:text-[#C9A227] hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-90 shadow-sm"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {maxSlideIndex > 0 && (
                <div className="max-w-[320px] mx-auto bg-stone-200/50 h-1 mt-8 rounded-full overflow-hidden relative">
                  <div 
                    className="bg-[#C9A227] h-full transition-all duration-500 rounded-full"
                    style={{ 
                      width: `${100 / (maxSlideIndex + 1)}%`,
                      transform: `translateX(${currentSlide * 100}%)`
                    }}
                  />
                </div>
              )}

              <div className="mt-12 text-center text-[13px] text-[#6B7280] font-normal italic border-t border-[#E5E0D3] pt-8 max-w-md mx-auto leading-[1.8]">
                * Data guru besar dan bidang keilmuan dikelola secara resmi oleh pengurus Perguruan Padjadjaran Pusat.
              </div>
            </div>
          </section>
        </main>
      </div>
      
      <PublicFooter />
    </div>
  );
}

