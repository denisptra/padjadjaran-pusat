import React from 'react';

interface BarChartProps {
  data: {
    label: string;
    value: number;
  }[];
  color?: string;
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  color = '#DCAF01',
  height = 160,
  showValues = false,
  horizontal = false
}) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  if (horizontal) {
    return (
      <div className="w-full flex flex-col gap-4">
        {data.map((item, idx) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={idx} className="flex items-center gap-3 w-full group">
              <div className="w-32 shrink-0 text-right">
                <span className="text-[12px] font-medium text-gray-700 truncate block" title={item.label}>{item.label}</span>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-5 bg-gray-100 rounded-r-md overflow-hidden relative">
                  <div 
                    className="h-full rounded-r-md transition-all duration-500 hover:brightness-110"
                    style={{ width: `${Math.max(percentage, 1)}%`, backgroundColor: color }}
                  />
                </div>
                {showValues && (
                  <div className="w-10 shrink-0 text-left">
                    <span className="text-[12px] font-bold text-gray-900">{item.value}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div 
        className="flex items-end justify-between gap-2 w-full" 
        style={{ height: `${height}px` }}
      >
        {data.map((item, idx) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              <div className="relative w-full flex justify-center items-end h-full">
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/95 backdrop-blur-sm text-white text-[11px] py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10 shadow-xl border border-white/10 flex flex-col items-center">
                  <span className="font-medium text-[12px]">{item.value}</span>
                  <span className="text-gray-400 text-[9px]">Anggota</span>
                </div>

                {/* Value Label */}
                {showValues && item.value > 0 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-700">
                    {item.value}
                  </span>
                )}
                
                {/* Bar */}
                <div 
                  className="w-full max-w-[28px] rounded-t-lg transition-all duration-500 group-hover:opacity-90 group-hover:scale-x-110 shadow-sm"
                  style={{ 
                    height: `${Math.max(percentage, 5)}%`,
                    backgroundColor: color 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* X-Axis Labels */}
      <div className="flex justify-between gap-2 mt-4 border-t border-gray-100 pt-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 text-center">
            <span className="text-[10px] font-medium text-gray-500 truncate block px-0.5" title={item.label}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
