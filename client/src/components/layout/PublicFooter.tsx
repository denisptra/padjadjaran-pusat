import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang', path: '/tentang' },
    { name: 'Verifikasi KTA', path: '/verifikasi' },
    { name: 'Kebijakan Privasi', path: '/kebijakan-privasi' },
    { name: 'Syarat & Ketentuan', path: '/syarat-ketentuan' },
  ];

  return (
    <footer className="bg-black border-t-2 border-[#C9A227]/40 text-stone-300 font-inter">
      {/* Top Footer Segment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr] gap-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <Logo />
          <p className="text-[13px] text-stone-400 leading-relaxed font-normal max-w-sm">
            Perguruan Pesantren Pencak Silat Padjadjaran Tasikmalaya berkomitmen melestarikan warisan budaya leluhur, mendidik karakter mental spiritual serta kecakapan fisik para pendekar bela diri bangsa.
          </p>

          {/* Social Media Links */}
          <div className="flex items-center gap-4 pt-2">
            <a 
              href="https://www.instagram.com/padjadjaranpusat" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center justify-center text-stone-400 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white hover:border-transparent hover:shadow-[0_0_15px_rgba(238,42,123,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer"
              title="Instagram"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="h-[16px] w-[16px]"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a 
              href="https://www.tiktok.com/@padjadjaran.pusat" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center justify-center text-stone-400 hover:bg-black hover:text-white hover:border-[#00f2fe]/40 hover:shadow-[-2px_-2px_10px_rgba(0,242,254,0.4),2px_2px_10px_rgba(254,9,121,0.4)] hover:scale-110 transition-all duration-300 cursor-pointer"
              title="TikTok"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="h-[16px] w-[16px]"
              >
                <path d="M12.525.02c1.31-.03 2.61-.01 3.91-.02.08 1.53.63 3.02 1.62 4.2 1.12 1.25 2.7 2.06 4.31 2.34v3.76a8.96 8.96 0 0 1-5.08-1.52c-.08-.05-.16-.1-.23-.15v7.24c0 1.9-.52 3.82-1.63 5.3-2.12 2.9-6.1 3.9-9.33 2.34-3.1-1.37-4.84-4.86-4.07-8.17.65-3.1 3.23-5.5 6.34-5.99.98-.16 1.99-.08 2.95.23v3.82a4.93 4.93 0 0 0-3.08-.26c-1.82.47-3.14 2.18-3.08 4.06.05 2.14 1.84 3.9 3.99 3.83a3.97 3.97 0 0 0 3.82-3.96V0h.01Z" />
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@padjadjaranpusat" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="h-9 w-9 rounded-lg bg-stone-950 border border-stone-800/80 flex items-center justify-center text-stone-400 hover:bg-gradient-to-r hover:from-[#e52d27] hover:to-[#b31217] hover:text-white hover:border-transparent hover:shadow-[0_0_15px_rgba(229,45,39,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer"
              title="YouTube"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className="h-[16px] w-[16px]"
              >
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.002 3.002 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93 .502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h3 className="text-[13px] font-cinzel font-semibold text-white mb-6 pb-2 border-b border-[#C9A227]/20 inline-block">
            Tautan Cepat
          </h3>
          <ul className="space-y-3.5 p-0 list-none">
            {links.map((link) => (
              <li key={link.name}>
                <Link to={link.path} className="text-[13px] text-stone-400 hover:text-[#C9A227] transition-colors flex items-center gap-2 cursor-pointer font-normal">
                  <span className="h-1.5 w-1.5 rounded-md bg-[#C9A227]/40 shrink-0" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="space-y-6">
          <h3 className="text-[13px] font-cinzel font-semibold text-white mb-2 pb-2 border-b border-[#C9A227]/20 inline-block">
            Sekretariat Pusat
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <Phone size={16} className="text-[#C9A227] shrink-0" />
              <p className="text-[13px] text-stone-400 font-normal">+62 853 1695 9491</p>
            </div>
            <div className="flex items-center gap-3.5">
              <Mail size={16} className="text-[#C9A227] shrink-0" />
              <p className="text-[13px] text-stone-400 font-normal">pusatpadjadjaran@gmail.com</p>
            </div>
            <div className="flex items-start gap-3.5">
              <MapPin size={16} className="text-[#C9A227] shrink-0 mt-0.5" />
              <p className="text-[13px] text-stone-400 leading-relaxed font-normal">
                Raya Sukaraja No.16, Sirnajaya, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46183
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Segment */}
      <div className="bg-black py-8 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <p className="text-[11px] text-stone-500 font-medium text-center lg:text-left">
            &copy; {currentYear} Padepokan Agung Pencak Silat Padjadjaran Pusat. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/kebijakan-privasi" className="text-[11px] text-stone-500 hover:text-[#C9A227] transition-colors font-medium">
              Kebijakan Privasi
            </Link>
            <div className="h-4 w-px bg-stone-800 hidden sm:block" />
            <Link to="/syarat-ketentuan" className="text-[11px] text-stone-500 hover:text-[#C9A227] transition-colors font-medium">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

