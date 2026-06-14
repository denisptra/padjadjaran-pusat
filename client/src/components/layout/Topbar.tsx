import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Menu,
  ChevronLeft,
  ChevronRight,
  Megaphone
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { API_URL } from '../../services/api';
import { DROPDOWN_MENU } from '../../config/menu';
import { notificationApi } from '../../services/notificationApi';
import { stripHtml } from '../../utils/stripHtml';
import { CreditCard, UserCheck, Globe } from 'lucide-react';

interface TopbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, role, logout, isImpersonating, stopImpersonate } = useAuthStore();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch recent notifications
  const fetchUnreadNotifications = async () => {
    try {
      const res = await notificationApi.getAll();
      const list = res.data?.data?.data || res.data?.data || res.data || [];
      // Store recent 10 notifications (both read and unread)
      setNotificationsList(list.slice(0, 10));
      // Calculate unread count
      const unreads = list.filter((item: any) => !item.isRead);
      setUnreadCount(unreads.length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadNotifications();
      // Poll every 30 seconds to refresh notifications dynamically
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownItems = (role ? DROPDOWN_MENU[role] : []) || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const avatarUrl = user?.avatarUrl
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_URL}${user.avatarUrl}`)
    : null;

  const showPhoto = avatarUrl && !imgError;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 shrink-0">
      {/* Left Section with Toggle Button */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer group shrink-0"
          title={isSidebarCollapsed ? "Buka Sidebar" : "Tutup Sidebar"}
        >
          <div className="hidden lg:block transition-transform duration-300 group-hover:scale-110">
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </div>
          <div className="lg:hidden">
            <Menu size={20} />
          </div>
        </button>

        {/* Search - Hidden on very small mobile */}
        <div className="hidden sm:block flex-1 max-w-md ml-2">
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Cari fitur..."
              className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 pl-10 pr-4 text-[13px] font-medium transition-all focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#DCAF01]/5 focus:border-[#DCAF01]"
            />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-6">
        {isImpersonating && (
          <div className="hidden md:flex items-center gap-3 bg-[#DCAF01]/10 border border-[#DCAF01]/20 px-3 py-1.5 rounded-md">
            <ShieldCheck size={14} className="text-[#DCAF01]" />
            <span className="text-[10px] font-semibold text-[#DCAF01] uppercase tracking-wider">Simulasi</span>
            <button 
              onClick={stopImpersonate}
              className="text-[10px] font-semibold text-gray-900 bg-[#DCAF01] px-2 py-0.5 rounded hover:bg-[#C49C00] transition-colors uppercase cursor-pointer border-0"
            >
              Out
            </button>
          </div>
        )}

        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer border-0 bg-transparent relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="fixed top-16 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-80 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-fade">
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between mb-1">
                <span className="text-[13px] font-bold text-gray-900">Pemberitahuan</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await notificationApi.markAllRead();
                          fetchUnreadNotifications();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="text-[10px] font-bold text-[#DCAF01] hover:text-[#b08d00] cursor-pointer border-0 bg-transparent outline-none"
                    >
                      Baca Semua
                    </button>
                  )}
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto pr-1">
                {notificationsList.length > 0 ? (
                  notificationsList.map((item) => (
                    <div
                      key={item.id}
                      onClick={async () => {
                        setIsNotifOpen(false);
                        setSelectedNotif(item);
                        
                        // Mark as read in background if unread
                        if (!item.isRead) {
                          try {
                            await notificationApi.markAsRead(item.id);
                            fetchUnreadNotifications();
                          } catch (e) {
                            console.error(e);
                          }
                        }
                      }}
                      className={cn(
                        "px-4 py-3 flex items-start gap-3 cursor-pointer transition-all border-b border-gray-50 last:border-b-0 relative hover:bg-gray-50/80",
                        !item.isRead ? "bg-[#FDF8E6]/60 font-semibold" : "bg-white opacity-70"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        item.type === 'PAYMENT' ? "bg-emerald-50 text-emerald-600" :
                        item.type === 'APPROVAL' ? "bg-blue-50 text-blue-600" :
                        "bg-[#DCAF01]/10 text-[#DCAF01]"
                      )}>
                        {item.type === 'PAYMENT' ? <CreditCard size={14} /> :
                         item.type === 'APPROVAL' ? <UserCheck size={14} /> :
                         <Megaphone size={14} />}
                      </div>
                      <div className="min-w-0 text-left flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[12px] font-bold text-gray-900 truncate uppercase tracking-tight">{item.title}</p>
                          {!item.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#DCAF01] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-1 leading-snug mt-0.5">{stripHtml(item.content)}</p>
                        <span className="text-[9px] text-gray-400 font-mono mt-1 inline-block">
                          {new Date(item.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-gray-400 text-[12px] italic font-medium font-sans">
                    Tidak ada pemberitahuan baru.
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100 my-1" />

              <Link
                to={
                  role === 'member' ? '/app/member/announcements' :
                  role === 'admin_wilayah' ? '/app/admin-wilayah/announcements' :
                  '/app/admin-pusat/announcements'
                }
                onClick={() => setIsNotifOpen(false)}
                className="block text-center text-[12px] font-bold text-[#DCAF01] hover:text-[#b08d00] py-1.5 transition-all no-underline uppercase tracking-wider"
              >
                Lihat Semua
              </Link>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 p-1 rounded-md transition-all cursor-pointer border-0 bg-transparent"
          >
            {showPhoto ? (
              <img
                src={avatarUrl!}
                alt={user?.fullName || 'Avatar'}
                onError={() => setImgError(true)}
                className="h-8 w-8 rounded-full object-cover shadow-sm border-2 border-[#DCAF01]/40"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#DCAF01] flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="text-left hidden md:block">
              <p className="text-[13px] font-semibold text-gray-900 leading-none mb-1">
                {user?.fullName?.split(' ')[0]}
              </p>
              <p className="text-[10px] text-gray-400 font-medium leading-none capitalize">
                {role?.replace('_', ' ')}
              </p>
            </div>
            <ChevronDown size={14} className={cn("text-gray-400 transition-transform hidden sm:block", isProfileOpen ? "rotate-180" : "")} />
          </button>

          {isProfileOpen && (
            <div className="fixed top-16 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 animate-fade">
              <div className="px-4 py-3 border-b border-gray-100 mb-1 flex items-center gap-3">
                {showPhoto ? (
                  <img
                    src={avatarUrl!}
                    alt={user?.fullName || 'Avatar'}
                    className="h-11 w-11 rounded-full object-cover border-2 border-[#DCAF01]/30 shrink-0"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#DCAF01] to-[#b08d00] flex items-center justify-center text-white font-semibold text-base shrink-0 shadow">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{user?.fullName}</p>
                  <p className="text-[11px] text-gray-500 truncate font-normal">{user?.email}</p>
                  <span className="text-[9px] px-2 py-0.5 bg-[#DCAF01]/10 text-[#b08d00] font-semibold rounded-full uppercase tracking-wider mt-1 inline-block">
                    {role?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <Link 
                to="/"
                className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all no-underline"
                onClick={() => setIsProfileOpen(false)}
              >
                <Globe size={16} /> Beranda
              </Link>

              {dropdownItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all no-underline"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <item.icon size={16} /> {item.label}
                </Link>
              ))}
              
              <div className="h-px bg-gray-100 my-1.5" />
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all border-0 bg-transparent cursor-pointer"
              >
                <LogOut size={16} /> Keluar Sistem 
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotif && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-[6px] animate-fade"
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999 }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-150 flex flex-col text-left animate-in zoom-in-95 duration-200 font-sans">
            <div className={cn(
              "p-6 border-b border-gray-100 text-white flex items-center gap-3",
              selectedNotif.type === 'PAYMENT' ? "bg-gradient-to-r from-emerald-600 to-teal-500" :
              selectedNotif.type === 'APPROVAL' ? "bg-gradient-to-r from-blue-600 to-indigo-500" :
              "bg-gradient-to-r from-gray-900 to-gray-800"
            )}>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                {selectedNotif.type === 'PAYMENT' ? <CreditCard size={20} /> :
                 selectedNotif.type === 'APPROVAL' ? <UserCheck size={20} /> :
                 <Megaphone size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-bold tracking-widest text-[#DCAF01] uppercase leading-none block mb-1">Pemberitahuan Sistem</span>
                <h3 className="text-base font-bold leading-tight break-words">{selectedNotif.title}</h3>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-96 text-gray-600 text-[13px] leading-relaxed font-sans">
              <div 
                className="prose prose-stone max-w-none text-left" 
                dangerouslySetInnerHTML={{ __html: selectedNotif.content }} 
              />
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                <span>Dikirim pada:</span>
                <span>{new Date(selectedNotif.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })} WIB</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 text-[12px] font-bold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all cursor-pointer font-sans"
              >
                Tutup
              </button>
              {/* Action Button if redirection route exists */}
              {(selectedNotif.type === 'ANNOUNCEMENT' || selectedNotif.type === 'PAYMENT' || selectedNotif.type === 'APPROVAL') && (
                <button
                  onClick={() => {
                    const type = selectedNotif.type;
                    const refId = selectedNotif.referenceId || selectedNotif.id;
                    setSelectedNotif(null);
                    
                    if (type === 'ANNOUNCEMENT') {
                      const detailPath = 
                        role === 'member' ? `/app/member/announcements/${refId}` :
                        role === 'admin_wilayah' ? `/app/admin-wilayah/announcements/${refId}` :
                        `/app/admin-pusat/announcements/${refId}`;
                      navigate(detailPath);
                    } else if (type === 'PAYMENT' || type === 'APPROVAL') {
                      const detailPath = 
                        role === 'member' ? `/app/member/dashboard` :
                        role === 'admin_wilayah' ? `/app/admin-wilayah/members` :
                        `/app/admin-pusat/members?tab=APPROVAL`;
                      navigate(detailPath);
                    }
                  }}
                  className="px-4 py-2 text-[12px] font-bold text-white bg-[#DCAF01] hover:bg-[#C49C00] rounded-lg shadow-sm transition-all cursor-pointer font-sans border-0"
                >
                  Tindak Lanjuti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
