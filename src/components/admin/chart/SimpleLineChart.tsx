// components/SimpleLineChart.tsx
import React from 'react';

interface SimpleLineChartProps {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}

export const SimpleLineChart: React.FC<SimpleLineChartProps> = ({ 
  data, 
  labels, 
  color = '#1890ff',
  height = 300
}) => {
  const maxValue = Math.max(...data);
  const minHeight = 50; // Minimum bar height for visibility

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute inset-0 flex items-end space-x-1">
        {data.map((value: number, index: number) => {
          const barHeight = maxValue > 0 
            ? Math.max((value / maxValue) * (height - 60), minHeight)
            : minHeight;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-6 rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer relative group"
                style={{ 
                  height: `${barHeight}px`,
                  backgroundColor: color
                }}
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {value.toLocaleString('vi-VN')} đ
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{labels[index]}</div>
              <div className="text-xs font-medium mt-1">
                {(value / 1000).toFixed(0)}K
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 w-8">
        {maxValue > 0 && (
          <>
            <span>{maxValue.toLocaleString('vi-VN')} đ</span>
            <span>0 đ</span>
          </>
        )}
      </div>
    </div>
  );
};