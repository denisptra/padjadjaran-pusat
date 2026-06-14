import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import { ROUTES } from '../../config/routes';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { getSecureFileUrl } from '../../services/api';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export default function PublicNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuthStore();
  const isAuthenticated = !!user;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Beranda', path: ROUTES.PUBLIC.HOME },
    { name: 'Tentang', path: ROUTES.PUBLIC.ABOUT },
    { name: 'Cabang', path: ROUTES.PUBLIC.BRANCHES },
    { name: 'Publikasi', path: ROUTES.PUBLIC.PUBLICATIONS },
    { name: 'Galeri', path: ROUTES.PUBLIC.GALLERY },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'super_admin') return '/app/super-admin/dashboard';
    if (user.role === 'admin_pusat') return '/app/admin-pusat/dashboard';
    if (user.role === 'admin_wilayah') return '/app/admin-wilayah/dashboard';
    return '/app/member/dashboard';
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-inter ${
        scrolled
          ? 'bg-black/80 backdrop-blur-md shadow-sm shadow-black/20 py-2'
          : 'bg-gradient-to-b from-black/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl py-2 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {/* Logo - Left Side */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="inline-block">
              <Logo />
            </Link>
          </div>

          {/* Desktop Nav Links - Center Side */}
          <div className="hidden lg:flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[12px] font-medium transition-all duration-200 relative py-1 group cursor-pointer ${
                  isActive(link.path)
                    ? 'text-[#C9A227]'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons - Right Side */}
          <div className="flex-1 hidden lg:flex items-center justify-end gap-3">
            {isAuthenticated ? (
               <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="h-8 w-8 rounded-full overflow-hidden transition-all duration-300 cursor-pointer border-2 border-[#C9A227]/40 hover:border-[#C9A227] focus:outline-none flex items-center justify-center shadow"
                  >
                    {user?.avatarUrl ? (
                      <img src={getSecureFileUrl(user.avatarUrl) || ''} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#C9A227] flex items-center justify-center text-stone-950 font-bold text-xs">
                        {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                    )}
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-stone-100 rounded-xl shadow-xl py-1.5 z-50 animate-fade">
                      <div className="px-4 py-2.5 border-b border-stone-100 mb-1">
                        <p className="text-[12px] font-semibold text-stone-900 truncate leading-none mb-1">{user?.fullName}</p>
                        <p className="text-[10px] text-stone-400 truncate leading-none font-normal">{user?.email}</p>
                      </div>
                      <Link 
                        to={getDashboardPath()} 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[12px] text-stone-700 hover:bg-stone-50 hover:text-[#C9A227] font-medium no-underline transition-all"
                      >
                        <LayoutDashboard size={14} /> Dashboard
                      </Link>
                      <div className="h-px bg-stone-100 my-1" />
                      <button 
                        onClick={async () => { await logout(); setIsDropdownOpen(false); }} 
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] text-red-600 hover:bg-red-50 font-medium border-0 bg-transparent cursor-pointer transition-all text-left"
                      >
                        <LogOut size={14} /> Keluar
                      </button>
                    </div>
                  )}
               </div>
            ) : (
              <Link to={ROUTES.AUTH.LOGIN}>
                <button className="px-5 py-2 text-[12px] font-bold bg-gradient-to-r from-[#C9A227] to-[#E5BE3C] hover:from-[#E5BE3C] hover:to-[#C9A227] text-stone-950 rounded-md transition-all duration-300 shadow-md shadow-[#C9A227]/10 hover:shadow-[#C9A227]/25 transform active:scale-95 cursor-pointer">
                  Masuk Anggota
                </button>
              </Link>
            )}
          </div>
          {/* Mobile Menu Button */}
          <div className="lg:hidden flex-1 flex justify-end">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-stone-300 hover:text-white p-2 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-x-0 top-[65px] bg-black/80 border-b border-[#C9A227]/25 transition-all duration-300 shadow-sm backdrop-blur-lg overflow-hidden ${
          isOpen ? 'max-h-screen opacity-100 py-6' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 space-y-4">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-3 rounded-lg text-[13px] font-medium transition-colors cursor-pointer ${
                  isActive(link.path)
                    ? 'bg-[#C9A227]/10 text-[#C9A227]'
                    : 'text-stone-300 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-stone-800 pt-4 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="w-full">
                  <button className="w-full py-3 text-[13px] font-semibold text-center bg-white text-stone-950 rounded-lg transition-all duration-200 cursor-pointer">
                    Dashboard
                  </button>
                </Link>
                <button onClick={async () => { await logout(); setIsOpen(false); }} className="w-full py-3 text-[13px] font-semibold text-center bg-red-600/10 text-red-500 rounded-lg transition-all duration-200 cursor-pointer">
                  Keluar
                </button>
              </>
            ) : (
              <Link to={ROUTES.AUTH.LOGIN} onClick={() => setIsOpen(false)} className="w-full">
                <button className="w-full py-3 text-[13px] font-semibold text-center bg-gradient-to-r from-[#C9A227] to-[#E5BE3C] text-stone-950 rounded-lg transition-all duration-200 cursor-pointer">
                  Masuk ke Portal
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

