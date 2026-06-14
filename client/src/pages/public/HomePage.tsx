import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import Button from '../../components/ui/Button';
import { GoogleIcon } from '../../components/ui/Icons';
import Skeleton from '../../components/ui/Skeleton';
import Padepokan from '../../assets/images/padepokan.jpeg';
import PadjadjaranVideo from '../../assets/video/padjadjaran.mp4';
import { publicApi } from '../../services/publicApi';
import { getSecureFileUrl } from '../../services/api';

const DEFAULT_SLIDES = [
  {
    image: Padepokan,
    eyebrow: 'Selamat Datang',
    title: 'Perguruan Pencak Silat Padjadjaran',
    description: 'Melestarikan seni budaya pencak silat warisan luhur nusantara sejak 1970.',
  }
];

function SectionHeader({ eyebrow, title, description, align = 'left' }: { eyebrow?: string, title: string, description?: string, align?: 'left' | 'center' }) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl mb-10`}>
      <div className={`${align === 'center' ? 'mx-auto' : ''} gold-line mb-4`} />
      {eyebrow && <p className="text-[13px] font-normal  tracking-normal text-[#C9A227] font-inter">{eyebrow}</p>}
      <h2 className="mt-2.5 font-cinzel text-2xl md:text-3xl font-semibold leading-snug text-stone-900 tracking-wide ">{title}</h2>
      {description && <p className="mt-4 text-[13px] leading-relaxed text-stone-600 font-inter font-normal">{description}</p>}
    </div>
  );
}

export default function HomePage() {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        const res = await publicApi.getHeroSliders();
        const payload = res.data.data || res.data;
        
        const activeSlides = (payload || [])
          .map((item: any) => ({
            image: getSecureFileUrl(item.imageUrl) || item.imageUrl,
            eyebrow: 'Padjadjaran',
            title: item.title,
            description: item.subtitle || '',
          }));
          
        if (activeSlides.length > 0) {
          setSlides(activeSlides);
        } else {
          setSlides([{
            image: Padepokan,
            eyebrow: 'Selamat Datang',
            title: 'Perguruan Pencak Silat Padjadjaran',
            description: 'Melestarikan seni budaya pencak silat warisan luhur nusantara sejak 1970.',
          }]);
        }
      } catch (err) {
        console.error('Failed to fetch CMS data', err);
        setSlides([{
          image: Padepokan,
          eyebrow: 'Selamat Datang',
          title: 'Perguruan Pencak Silat Padjadjaran',
          description: 'Melestarikan seni budaya pencak silat warisan luhur nusantara sejak 1970.',
        }]);
      } finally {
        setLoading(false);
      }
    };

    fetchCmsData();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [slides]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % (slides.length || 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + (slides.length || 1)) % (slides.length || 1));

  return (
    <>
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative min-h-[700px] sm:min-h-[760px] w-full overflow-hidden bg-stone-950 text-white select-none">
        {loading ? (
          <Skeleton className="absolute inset-0 w-full h-full opacity-20" />
        ) : (
          <div className="absolute inset-0 z-0">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover filter grayscale contrast-[1.25] brightness-[0.34]"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />
              </div>
            ))}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex min-h-[700px] sm:min-h-[700px] items-center justify-center text-center">
          {loading ? (
            <div className="w-full max-w-2xl space-y-4">
              <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
              <Skeleton className="h-16 w-full bg-white/20" />
              <Skeleton className="h-4 w-3/4 mx-auto bg-white/20" />
            </div>
          ) : (
            slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center px-4 transition-all duration-700 transform ${index === currentSlide
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
              >
                <div className="max-w-4xl mx-auto flex flex-col items-center">
                  <div className="mb-4 flex items-center justify-center gap-3.5">
                    <span className="h-px w-10 bg-[#C9A227]" />
                    <p className="text-[13px] font-normal tracking-[0.25em] text-[#C9A227] font-inter ">
                      {slide.eyebrow}
                    </p>
                    <span className="h-px w-10 bg-[#C9A227]" />
                  </div>

                  <h1 className="font-cinzel text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-wide text-white drop-shadow-md text-center">
                    {slide.title}
                  </h1>

                  <p className="mt-6 max-w-2xl mx-auto text-[13px] leading-relaxed text-stone-300 font-normal font-inter text-center">
                    {slide.description}
                  </p>

                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center w-full max-w-md mx-auto">
                    <Link to="/cabang" className="w-full sm:w-auto">
                      <Button className="w-full rounded-md shadow-none h-11 px-8">
                        <span>Lihat Cabang Kami</span>
                      </Button>
                    </Link>
                    <Link to="/tentang" className="w-full sm:w-auto">
                      <Button variant="outline" className="w-full bg-transparent border-1 border-white text-white hover:bg-white hover:text-stone-900 rounded-md h-11 px-8">
                        Pelajari Lebih Lanjut
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border border-white/20 bg-black/35 hover:bg-white hover:text-[#111111] text-white transition duration-200 flex items-center justify-center cursor-pointer active:scale-95"
            >
              <GoogleIcon name="chevron_left" size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border border-white/20 bg-black/35 hover:bg-white hover:text-[#111111] text-white transition duration-200 flex items-center justify-center cursor-pointer active:scale-95"
            >
              <GoogleIcon name="chevron_right" size={24} />
            </button>

            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-md transition-all duration-300 ${index === currentSlide ? 'w-8 bg-[#C9A227]' : 'w-3.5 bg-white/40 hover:bg-white'
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* 2. ABOUT SECTION */}
      <section id="tentang" className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-[#E5E0D3] bg-stone-100 group shadow-sm">
            {loading ? (
              <Skeleton className="absolute inset-0 w-full h-full" />
            ) : (
              <img
                src={Padepokan}
                alt="Padepokan Padjadjaran"
                className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105 filter sepia-[0.2] contrast-[1.1]"
              />
            )}
          </div>

          <div>
            <SectionHeader
              eyebrow="Tentang Kami"
              title="Perguruan Pencak Silat Bersejarah Sejak 1970"
              description="Berdiri pada tradisi luhur kerajaan Padjadjaran, padepokan ini telah mendedikasikan lebih dari lima dekade untuk membentuk karakter, fisik, and spiritual para pemuda bangsa."
            />
            <div className="mt-7 space-y-4">
              {[
                "Kurikulum terstruktur untuk semua tingkat usia.",
                "Pengajar bersertifikat nasional dan internasional.",
                "Pusat pengembangan seni budaya dan mental spiritual."
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-brand-500/10 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-500 group-hover:scale-110">
                    <GoogleIcon name="check" size={14} className="text-brand-500 group-hover:text-white" />
                  </div>
                  <span className="text-[13px] text-stone-600 font-normal">{text}</span>
                </div>
              ))}
            </div>
            <Link to="/tentang">
              <Button className="mt-10 h-11 px-8">Selengkapnya</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. VIDEO SECTION */}
      <section className="bg-white py-16 md:py-24 border-t border-[#E5E0D3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            align="center"
            title="Mengenal Pencak Silat Padjadjaran"
            description="Lihat suasana latihan dan nilai yang dibangun di Padepokan Padjadjaran Pusat."
          />

          <div className="relative mt-12 w-full max-w-4xl mx-auto aspect-video overflow-hidden rounded-lg border border-[#E5E0D3] bg-black shadow-md flex items-center justify-center group">
            <video
              src={PadjadjaranVideo}
              className="w-full h-full object-cover"
              controls
            />
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}

