'use client';

import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface StatisticChartProps {
  data: number[];
  labels: string[];
  type: 'bar' | 'line' | 'pie';
  color?: string;
  colors?: string[];
}

export default function StatisticChart({ data, labels, type, color = '#1890ff', colors }: StatisticChartProps) {
  const baseData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors || [color],
        borderColor: colors || [color],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'pie',
        position: 'bottom' as const,
      },
    },
    scales: type !== 'pie' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={baseData} options={options} />;
      case 'line':
        return <Line data={baseData} options={options} />;
      case 'pie':
        return <Pie data={baseData} options={options} />;
      default:
        return <Bar data={baseData} options={options} />;
    }
  };

  return <div className="h-64">{renderChart()}</div>;
}