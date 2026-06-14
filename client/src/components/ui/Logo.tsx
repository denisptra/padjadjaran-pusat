import { cn } from '../../utils/cn';
import LogoKasepuhan from '../../assets/images/logo-kasepuhan.png';
import LogoPencakSilat from '../../assets/images/logo-pencaksilat.svg';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  collapsed?: boolean;
  variant?: 'default' | 'single';
  theme?: 'light' | 'dark';
}

export default function Logo({
  className = '',
  imageClassName = '',
  textClassName = '',
  collapsed = false,
  variant = 'default',
  theme = 'light'
}: LogoProps) {
  const isDark = theme === 'dark';

  if (variant === 'single') {
    return (
      <div className={cn("flex items-center gap-2.5 group select-none", className)}>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={cn("h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden", imageClassName)}>
             <img src={LogoKasepuhan} alt="Kasepuhan" className="w-full h-full object-contain" />
          </div>
          <div className={cn("h-7 w-7 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden", imageClassName)}>
             <img src={LogoPencakSilat} alt="Pencak Silat" className="w-full h-full object-contain" />
          </div>
        </div>
        {!collapsed && (
          <span className={cn(
            "font-jawa text-[10px] font-medium tracking-widest",
            isDark ? "text-stone-900" : "text-white",
            textClassName
          )}>
            PADJADJARAN
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 group select-none", className)}>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden", imageClassName)}>
           <img src={LogoKasepuhan} alt="Kasepuhan" className="w-full h-full object-contain" />
        </div>
        <div className={cn("h-8 w-8 rounded-full bg-white flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden p-0.1", imageClassName)}>
           <img src={LogoPencakSilat} alt="Pencak Silat" className="w-full h-full object-contain" />
        </div>
      </div>
      {!collapsed && (
        <div className="flex flex-col justify-center min-w-0">
          <span className={cn(
            "text-[9px] italic font-normal leading-none uppercase tracking-tighter",
            isDark ? "text-stone-500" : "text-stone-300"
          )}>
            Padepokan Pencak Silat
          </span>

          <div className={cn(
            "mt-1 mb-2 h-px w-full bg-gradient-to-r from-transparent to-transparent",
            isDark ? "via-stone-200" : "via-white/70"
          )} />

          <span className={cn(
            "font-jawa text-[12px] text-[#C9A227] leading-none block group-hover:text-[#C9A227] transition-colors font-normal tracking-wider",
            textClassName
          )}>
            PADJADJARAN
          </span>
        </div>
      )}
    </div>
  );
}
