import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import { GoogleIcon } from '../../components/ui/Icons';
import Skeleton from '../../components/ui/Skeleton';
import defaultImg from '../../assets/images/padepokan.jpeg';
import { publicApi } from '../../services/publicApi';
import { cmsApi } from '../../services/cmsApi';
import { getSecureFileUrl } from '../../services/api';

export default function PublicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<any>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<{ name: string, count: number }[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchArticleDetail = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const res = await publicApi.getNews(); // Fetches all publications
        const allPubs = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        
        const current = allPubs.find((p: any) => p.slug === id);
        if (current) {
          setArticle({
            id: current.id,
            slug: current.slug,
            title: current.title,
            type: current.type === 'BERITA' ? 'Berita' : 'Artikel',
            category: current.category || 'Umum',
            date: new Date(current.createdAt).toLocaleDateString('id-ID'),
            description: current.content ? current.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
            image: getSecureFileUrl(current.imageUrl) || current.imageUrl || defaultImg,
            content: current.content || '',
          });

          // Record view
          try {
            const sessionId = sessionStorage.getItem('pub_session_id') || Math.random().toString(36).substring(2);
            sessionStorage.setItem('pub_session_id', sessionId);
            await cmsApi.recordPublicationView(current.id, sessionId);
          } catch (e) {
            console.error('Failed to record view', e);
          }
        }

        // Recent items (excluding current)
        const others = allPubs
          .filter((p: any) => p.slug !== id)
          .slice(0, 3)
          .map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            date: new Date(p.createdAt).toLocaleDateString('id-ID'),
            image: getSecureFileUrl(p.imageUrl) || p.imageUrl || defaultImg,
          }));
        setRecentArticles(others);

        // Sidebar categories (Dynamic from Kategori field)
        const countsMap: Record<string, number> = {};
        allPubs.forEach((p: any) => {
          const cat = (p.category || 'Umum').charAt(0).toUpperCase() + (p.category || 'Umum').slice(1).toLowerCase();
          countsMap[cat] = (countsMap[cat] || 0) + 1;
        });

        const countsArray = Object.entries(countsMap).map(([name, count]) => ({ name, count }));
        setCategoryCounts([{ name: 'Semua Publikasi', count: allPubs.length }, ...countsArray.sort((a, b) => a.name.localeCompare(b.name))]);

      } catch (err) {
        console.error('Failed to fetch publication detail', err);
        setArticle(null);
      } finally {
        setLoading(false);
      }
    };
    fetchArticleDetail();
  }, [id]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${article?.title}\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="bg-white min-h-screen pt-28 pb-0 font-inter text-left">
      <PublicNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <button 
          onClick={() => navigate('/publikasi')} 
          className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7280] hover:text-[#C9A227] transition-colors duration-200 mb-8 group cursor-pointer border-0 bg-transparent"
        >
          <GoogleIcon name="arrow_back" size={18} className="group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Wawasan
        </button>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start animate-fadeIn">
            <div className="space-y-6">
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="w-full aspect-video" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex gap-4">
                  <Skeleton className="h-20 w-20 shrink-0" />
                  <div className="space-y-2 flex-grow">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : article ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start animate-fadeIn">
            <article className="bg-white">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[12px] font-bold tracking-[0.15em] text-[#C9A227] bg-[#FAF6EE] border border-[#C9A227]/20 px-3 py-1 rounded-md uppercase">
                  {article.type}
                </span>
                {article.category && article.category.toLowerCase() !== article.type.toLowerCase() && (
                   <span className="text-[12px] font-medium text-stone-500 bg-stone-50 border border-stone-200 px-3 py-1 rounded-md uppercase">
                      {article.category}
                   </span>
                )}
                <span className="text-[13px] text-stone-400 flex items-center gap-1.5 font-inter sm:ml-auto">
                  <GoogleIcon name="calendar_today" size={14} />
                  {article.date}
                </span>
              </div>

              <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl leading-tight font-semibold text-neutral-950 mb-6 tracking-wide">
                {article.title}
              </h1>

              <p className="text-[12px] text-stone-500 leading-relaxed border-l-4 border-[#C9A227] pl-5 mb-8 italic">
                {article.description}
              </p>

              <div className="w-full aspect-[16/9] overflow-hidden mb-10 bg-stone-50 border border-[#E5E0D3] rounded-lg shadow-sm">
                <img src={article.image || defaultImg} alt={article.title} className="w-full h-full object-cover" />
              </div>

              <div 
                className="text-[12px] text-[#374151] leading-[1.8] space-y-6 font-normal font-inter text-justify"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              <div className="mt-8 pt-8 border-t border-[#E5E0D3]/50">
                <p className="text-[11px] font-normal tracking-normal text-stone-400 mb-4 flex items-center gap-2">
                  <GoogleIcon name="share" size={14} className="text-[#C9A227]" /> Bagikan Artikel
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <button onClick={shareWhatsApp} className="flex items-center gap-2 h-10 px-5 text-[11px] font-normal tracking-wider rounded-md bg-[#25D366] text-white hover:bg-[#20ba59] transition-all cursor-pointer border-0 active:scale-95 shadow-sm">
                    WhatsApp</button>
                  <button className="flex items-center gap-2 h-10 px-5 text-[11px] font-normal tracking-wider rounded-md bg-[#1877F2] text-white hover:bg-[#1565d8] transition-all cursor-pointer border-0 active:scale-95 shadow-sm">
                    Facebook</button>
                </div>
              </div>
            </article>

            <aside className="flex flex-col gap-8 lg:sticky lg:top-24">
              <div className="bg-white border border-[#E5E0D3] p-6 rounded-lg shadow-sm text-left">
                <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#111111] mb-5 flex items-center gap-2 font-cinzel">
                  <span className="w-1 h-4 bg-[#C9A227] rounded-full"></span>
                  KATEGORI
                </h4>
                <ul className="flex flex-col gap-1.5 p-0 list-none font-inter">
                  {categoryCounts.map((cat, idx) => (
                    <li key={idx} onClick={() => navigate('/publikasi')} className="flex items-center justify-between text-[12px] text-stone-600 hover:text-[#C9A227] cursor-pointer transition-all group py-2 border-b border-stone-50 last:border-0">
                      <span className="flex items-center gap-2 font-normal">
                        <GoogleIcon name="chevron_right" size={14} className="group-hover:translate-x-0.5 transition-transform text-[#C9A227]/60" />
                        {cat.name}
                      </span>
                      <span className="text-[10px] bg-[#FAF6EE] px-2 py-0.5 rounded-md text-[#C9A227] font-normal border border-[#C9A227]/10">{cat.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-[#E5E0D3] p-6 rounded-lg shadow-sm text-left">
                <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#111111] mb-5 flex items-center gap-2 font-cinzel">
                  <span className="w-1 h-4 bg-[#C9A227] rounded-full"></span>
                  TERBARU
                </h4>
                <div className="flex flex-col gap-5">
                  {recentArticles.map((post) => (
                    <div key={post.id} className="flex gap-4 cursor-pointer group" onClick={() => navigate(`/publikasi/${post.slug}`)}>
                      <div className="w-16 h-16 shrink-0 bg-stone-50 overflow-hidden rounded-md border border-[#E5E0D3]">
                        <img src={post.image || defaultImg} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="flex flex-col gap-1.5 justify-center">
                        <p className="text-[12px] font-normal text-stone-800 leading-snug group-hover:text-[#C9A227] transition-colors line-clamp-2 font-cinzel font-semibold">{post.title}</p>
                        <span className="text-[10px] text-stone-400 flex items-center gap-1 font-inter"><GoogleIcon name="calendar_today" size={10} className="text-[#C9A227]" /> {post.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="py-20 text-center text-stone-400 text-[13px] italic animate-fadeIn">
            <GoogleIcon name="search_off" size={48} className="mb-4 opacity-20 mx-auto" />
            <p>Konten tidak ditemukan.</p>
            <Link to="/publikasi" className="mt-4 inline-block text-[#C9A227] hover:underline">Kembali ke Wawasan</Link>
          </div>
        )}
      </div>

      <div className="pb-0">
        <PublicFooter />
      </div>
    </div>
  );
}
