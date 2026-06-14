import { useState, useEffect } from 'react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import { GoogleIcon } from '../../components/ui/Icons';
import Skeleton from '../../components/ui/Skeleton';
import Pagination from '../../components/ui/Pagination';
const defaultImg = 'https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=1200';
import { publicApi } from '../../services/publicApi';
import { getSecureFileUrl } from '../../services/api';

const ITEMS_PER_PAGE = 6;

export default function GalleryPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState(['Semua']);

  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        setLoading(true);
        const res = await publicApi.getGallery();
        const gallery = res.data.data || res.data;
        
        const activePhotos = (gallery || [])
          .map((item: any) => {
            const rawCat = item.category || 'Umum';
            const formattedCat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase();
            
            return {
              id: item.id,
              title: item.title,
              category: formattedCat,
              date: new Date(item.createdAt).toLocaleDateString('id-ID'),
              image: getSecureFileUrl(item.imageUrl) || item.imageUrl || defaultImg,
              desc: item.description || '',
            };
          });
        setPhotos(activePhotos);
        
        // Extract dynamic categories
        const dynamicCats = Array.from(new Set(activePhotos.map((p: any) => p.category))) as string[];
        const sortedCats = dynamicCats.sort();
        setCategories(['Semua', ...sortedCats]);
      } catch (err) {
        console.error('Failed to fetch gallery', err);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCmsData();
  }, []);

  useEffect(() => {
    if (photos.length === 0) return;
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [activeCategory, currentPage, photos]);

  const filteredPhotos = activeCategory === 'Semua'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  const totalPages = Math.ceil(filteredPhotos.length / ITEMS_PER_PAGE);
  const displayedPhotos = filteredPhotos.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between font-inter">
      <div>
        <PublicNavbar />
        <main>
          <section
            className="bg-cover bg-center pt-44 pb-24 border-b border-[#E5E0D3] relative"
            style={{ backgroundImage: `linear-gradient(rgba(28, 24, 18, 0.75), rgba(28, 24, 18, 0.9)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200')` }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] text-[#C9A227] font-cinzel font-semibold mb-4 tracking-tight drop-shadow-md">Galeri Kegiatan</h1>
              <p className="text-[13px] text-white/85 max-w-[650px] mx-auto font-medium leading-relaxed font-inter">Dokumentasi Latihan, Kejuaraan, Pusaka Bersejarah, dan Kegiatan Kebudayaan Padjadjaran.</p>
            </div>
          </section>

          <section className="bg-white border-b border-stone-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                  className={`py-6 text-[13px] font-normal relative transition-all cursor-pointer bg-transparent border-0
                    ${activeCategory === cat ? 'text-[#C9A227] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#C9A227]' : 'text-stone-400 hover:text-stone-900'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <section className="py-16 pb-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />)
                ) : displayedPhotos.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-stone-400 text-[13px] font-normal">Belum ada foto dalam kategori ini.</div>
                ) : (
                  displayedPhotos.map((photo) => (
                    <article
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo)}
                      className="relative overflow-hidden rounded-2xl group aspect-[4/3] bg-stone-900 cursor-pointer shadow-xl border border-stone-100"
                    >
                      <img src={photo.image} className="w-full h-full object-cover filter brightness-90 transition-all duration-700 group-hover:scale-105" />
                      {/* Gradient Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <span className="bg-[#C9A227] text-white text-[10px] font-normal px-3 py-1 rounded-full  self-start mb-3">{photo.category}</span>
                        <h3 className="font-cinzel text-[13px] font-semibold text-white  mb-2 tracking-wide">{photo.title}</h3>
                        <p className="text-[12px] text-stone-300 line-clamp-2 leading-relaxed">{photo.desc}</p>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-16"
              />
            </div>
          </section>
        </main>
      </div>

      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 overflow-y-auto" 
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="max-w-4xl w-full relative animate-fadeIn my-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Container */}
            <div className="relative bg-stone-900 rounded-t-3xl overflow-hidden border-x border-t border-white/10 shadow-2xl">
              <img 
                src={selectedPhoto.image} 
                className="w-full h-auto max-h-[70vh] object-contain mx-auto" 
                alt={selectedPhoto.title}
              />
              
              {/* Floating Close Button */}
              <button 
                className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-[#C9A227] text-white transition-all border-0 cursor-pointer backdrop-blur-md" 
                onClick={() => setSelectedPhoto(null)}
              >
                <GoogleIcon name="close" size={24} />
              </button>
            </div>

            {/* Info Container */}
            <div className="bg-stone-950 p-8 sm:p-10 rounded-b-3xl border-x border-b border-white/10 text-center">
              <span className="px-3 py-1 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] text-[10px] font-bold rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
                {selectedPhoto.category}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white tracking-widest leading-snug">
                {selectedPhoto.title}
              </h3>
              {selectedPhoto.desc && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-stone-400 text-[13px] sm:text-[14px] max-w-2xl mx-auto leading-relaxed font-inter italic">
                    "{selectedPhoto.desc}"
                  </p>
                </div>
              )}
              <div className="mt-6 text-[10px] text-stone-500 font-mono tracking-tighter uppercase">
                Dokumentasi Kegiatan • {selectedPhoto.date}
              </div>
            </div>
          </div>
        </div>
      )}
      <PublicFooter />
    </div>
  );
}

