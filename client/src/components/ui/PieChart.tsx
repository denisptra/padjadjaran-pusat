import React from 'react';

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 35;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~219.911

  let accumulatedOffset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-4">
      {/* SVG Donut Chart */}
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {total === 0 ? (
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#F3F4F6"
              strokeWidth={strokeWidth}
            />
          ) : (
            data.map((item, idx) => {
              const pct = (item.value / total) * 100;
              const strokeLength = (pct / 100) * circumference;
              const strokeOffset = -accumulatedOffset;
              accumulatedOffset += strokeLength;

              return (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="butt"
                  className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                  style={{ transformOrigin: '50px 50px' }}
                />
              );
            })
          )}
        </svg>

        {/* Center Label for Donut style */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-medium text-gray-400 tracking-wide">Total</span>
          <span className="text-[22px] font-semibold text-gray-900 leading-none mt-1">{total}</span>
        </div>
      </div>

      {/* Legend with matching styling */}
      <div className="flex flex-col gap-3 flex-grow text-left w-full sm:w-auto">
        {data.map((item, idx) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-[13px] border-b border-gray-50 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-gray-600 text-[12px]">{item.name}</span>
              </div>
              <span className="font-semibold text-gray-900 ml-4">
                {item.value} <span className="text-gray-400 font-normal">({pct.toFixed(0)}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PieChart;
