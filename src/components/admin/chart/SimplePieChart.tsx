// components/SimplePieChart.tsx
import React from 'react';

interface SimplePieChartProps {
  data: number[];
  labels: string[];
  colors?: string[];
}

export const SimplePieChart: React.FC<SimplePieChartProps> = ({ 
  data, 
  labels, 
  colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa541c', '#13c2c2']
}) => {
  const total = data.reduce((sum: number, value: number) => sum + value, 0);
  
  if (total === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <span className="text-gray-500">Không có dữ liệu</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((value: number, index: number) => {
        const percentage = ((value / total) * 100).toFixed(1);
        return (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm">{labels[index]}</span>
            </div>
            <div className="text-right">
              <div className="font-medium">{value}</div>
              <div className="text-xs text-gray-500">{percentage}%</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};