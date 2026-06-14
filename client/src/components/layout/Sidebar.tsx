import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { MENU_CONFIG, MenuItem } from '../../config/menu';
import { 
  ChevronDown,
  LogOut,
  Headset,
  HelpCircle,
  X
} from 'lucide-react';
import LogoKasepuhan from '../../assets/images/logo-kasepuhan.png';
import LogoPencakSilat from '../../assets/images/logo-pencaksilat.svg';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isCollapsed?: boolean;
  className?: string;
  onMobileClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, className, onMobileClose }) => {
  const { role, logout } = useAuthStore();
  const navigate = useNavigate();
  const menuItems = (role ? MENU_CONFIG[role] : []) || [];
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (key: string) => {
    setExpandedMenus(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={cn(
      "bg-[#111827] text-[#D1D5DB] flex flex-col h-screen shrink-0 border-r border-[#1F2937] z-30 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64",
      className
    )}>
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#1F2937] shrink-0 justify-between">
        <Link 
          to={
            role === 'super_admin' ? '/app/super-admin/dashboard' :
            role === 'admin_pusat' ? '/app/admin-pusat/dashboard' :
            role === 'admin_wilayah' ? '/app/admin-wilayah/dashboard' :
            '/app/member/dashboard'
          }
          className="flex items-center gap-2 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity no-underline text-inherit group"
        >
          <div className="h-8 w-8 shrink-0 bg-white rounded-full p-0.5 flex items-center justify-center transition-transform group-hover:scale-105">
             <img src={LogoPencakSilat} alt="Pencak Silat" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && (
            <span className="font-jawa text-[15px] text-white font-normal tracking-wider truncate">
              PADJADJARAN
            </span>
          )}
        </Link>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onMobileClose}
          className="lg:hidden p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer bg-transparent border-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 no-scrollbar">
        <ul className="space-y-1 px-3">
          {menuItems.map((item: MenuItem) => {
            const Icon = item.icon || HelpCircle;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isExpanded = expandedMenus.includes(item.label);

            if (hasSubmenu && !isCollapsed) {
              return (
                <li key={item.label}>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-md text-[13px] font-medium transition-all hover:bg-white/5 hover:text-white border-0 bg-transparent cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className="text-[#D1D5DB] group-hover:text-white" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "")} />
                  </button>
                  
                  {isExpanded && (
                    <ul className="mt-1 space-y-1 pl-11">
                      {item.submenu?.map((sub) => (
                        <li key={sub.label}>
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) => cn(
                              "flex items-center py-2 text-[12px] transition-all hover:text-white",
                              isActive ? "text-[#DCAF01] font-semibold" : "text-[#9CA3AF]"
                            )}
                          >
                            {sub.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  title={isCollapsed ? item.label : ''}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-md text-[13px] font-medium transition-all relative group",
                    isActive 
                      ? "bg-[#DCAF01] text-white" 
                      : "hover:bg-white/5 hover:text-white",
                    isCollapsed ? "justify-center px-0 h-10 w-10 mx-auto" : ""
                  )}
                >
                  <Icon size={18} className={cn(isCollapsed ? "shrink-0" : "")} />
                  {!isCollapsed && <span>{item.label}</span>}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                       {item.label}
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout & Support Footer */}
      <div className={cn(
        "p-4 border-t border-[#1F2937] bg-[#0F172A]/50 space-y-2",
        isCollapsed ? "flex flex-col items-center" : ""
      )}>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noreferrer"
          title={isCollapsed ? "Kontak Support" : ""}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-md text-[13px] font-medium transition-all hover:bg-white/5 hover:text-white no-underline text-[#D1D5DB] group relative",
            isCollapsed ? "justify-center px-0 h-10 w-10" : ""
          )}
        >
          <Headset size={18} />
          {!isCollapsed && <span>Kontak Support</span>}
          {isCollapsed && (
             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                Kontak Support
             </div>
          )}
        </a>
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Keluar Sistem" : ""}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[13px] font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border-0 bg-transparent cursor-pointer group relative",
            isCollapsed ? "justify-center px-0 h-10 w-10" : ""
          )}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Keluar Sistem</span>}
          {isCollapsed && (
             <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-[11px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                Keluar Sistem
             </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
