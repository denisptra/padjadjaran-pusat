import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import ArticleCard from '../../components/public/ArticleCard';
import Pagination from '../../components/ui/Pagination';
import Skeleton from '../../components/ui/Skeleton';
import { publicApi } from '../../services/publicApi';
import { getSecureFileUrl } from '../../services/api';

const ITEMS_PER_PAGE = 6;

export default function PublicationPage() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['Semua']);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await publicApi.getNews(); // Refactored to fetch from unified publications
      const payload = Array.isArray(res.data) ? res.data : (res.data?.data || []);

      const list = payload.map((item: any) => ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        type: item.type === 'BERITA' ? 'Berita' : 'Artikel',
        category: item.category || 'Umum',
        date: new Date(item.createdAt).toLocaleDateString('id-ID'),
        description: item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
        image: getSecureFileUrl(item.imageUrl) || item.imageUrl || 'https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=800',
      }));

      setArticles(list);

      // Extract unique categories (Top navigation uses Kategori)
      const dynamicCats = Array.from(new Set(list.map((a: any) => {
        const cat = a.category || '';
        return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
      }))) as string[];
      
      setCategories(['Semua', ...dynamicCats.filter(c => c !== '').sort()]);
    } catch (err) {
      console.error('Gagal memuat artikel publik.', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = activeCategory === 'Semua' 
    ? articles 
    : articles.filter(a => {
        const cat = (a.category || '').toLowerCase();
        return cat === activeCategory.toLowerCase();
      });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const displayedArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between font-inter text-left">
      <div>
        <PublicNavbar />
        <main>
          <section
            className="bg-cover bg-center pt-44 pb-24 border-b border-[#E5E0D3] relative"
            style={{ backgroundImage: `linear-gradient(rgba(28, 24, 18, 0.75), rgba(28, 24, 18, 0.9)), url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200')` }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <h1 className="text-2xl md:text-3xl lg:text-[2.2rem] text-[#C9A227] font-cinzel font-semibold mb-4 tracking-tight drop-shadow-md">Wawasan</h1>
              <p className="text-[13px] text-white/85 max-w-[650px] mx-auto font-medium leading-relaxed font-inter">Berita, Artikel, dan Informasi Terkini dari Padepokan Pencak Silat Padjadjaran Pusat.</p>
            </div>
          </section>

          {/* Categories with Sentence Case */}
          <section className="bg-white border-b border-stone-100 shadow-sm overflow-x-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 whitespace-nowrap">
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

          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-video w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))
                ) : displayedArticles.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-stone-400 text-[13px] font-normal">Belum ada publikasi di kategori ini.</div>
                ) : (
                  displayedArticles.map((article, index) => (
                    <Link key={article.id} to={`/publikasi/${article.slug}`}>
                      <ArticleCard article={article} index={index} onClick={() => {}} />
                    </Link>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="mt-16"
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
