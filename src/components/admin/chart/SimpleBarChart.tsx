// components/SimpleBarChart.tsx
import React from 'react';
import { Progress } from 'antd';

interface SimpleBarChartProps {
  data: number[];
  labels: string[];
  title?: string;
  color?: string;
  showValues?: boolean;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ 
  data, 
  labels, 
  title,
  color = '#1890ff',
  showValues = true
}) => {
  const maxValue = Math.max(...data);
  
  if (maxValue === 0) {
    return (
      <div className="space-y-2">
        {title && <h4 className="font-medium">{title}</h4>}
        <div className="text-center text-gray-500 py-4">
          Không có dữ liệu
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && <h4 className="font-medium">{title}</h4>}
      {data.map((value: number, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="w-16 text-sm text-gray-600">{labels[index]}</span>
          <div className="flex-1">
            <Progress 
              percent={(value / maxValue) * 100} 
              showInfo={false}
              strokeColor={color}
            />
          </div>
          {showValues && (
            <span className="w-12 text-sm font-medium text-right">
              {value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};