// components/MonthlyRevenueChart.tsx
import { useMonthlyRevenue } from '@/hooks/order/useMonthlyRevenue';
import { Card, Spin, Select, Row, Col, Statistic } from 'antd';
import { SimpleLineChart } from './SimpleLineChart';


const { Option } = Select;

interface MonthlyRevenueChartProps {
  year?: number;
  height?: number;
}

export const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ 
  year = new Date().getFullYear(), 
  height = 400 
}) => {
  const { data, isLoading, error } = useMonthlyRevenue(year);

  if (error) {
    return (
      <Card title={`Doanh thu theo tháng - ${year}`}>
        <div className="text-center text-red-500 py-8">
          Lỗi khi tải dữ liệu biểu đồ
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title={`Doanh thu theo tháng - ${year}`}>
        <div className="flex justify-center items-center" style={{ height: height - 100 }}>
          <Spin tip="Đang tải dữ liệu..." />
        </div>
      </Card>
    );
  }

  const monthlyData = data?.monthlyData || Array(12).fill({ revenue: 0, orderCount: 0 });
  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const maxMonth = monthlyData.reduce((max, item, index) => 
    item.revenue > monthlyData[max].revenue ? index : max, 0
  );

  return (
    <Card 
      title={`Doanh thu theo tháng - ${year}`}
      extra={
        <Select defaultValue={year.toString()} style={{ width: 120 }}>
          <Option value="2024">2024</Option>
          <Option value="2025">2025</Option>
        </Select>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <SimpleLineChart
            data={monthlyData.map(item => item.revenue)}
            labels={['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']}
            color="#1890ff"
            height={height - 150}
          />
        </Col>
      </Row>
      
      <Row gutter={16} className="mt-4">
        <Col xs={8}>
          <Statistic
            title="Tổng doanh thu năm"
            value={totalRevenue}
            formatter={(value) => 
              new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                .format(value as number)
            }
          />
        </Col>
        <Col xs={8}>
          <Statistic
            title="Tháng cao nhất"
            value={`T${maxMonth + 1}`}
          />
        </Col>
        <Col xs={8}>
          <Statistic
            title="Doanh thu cao nhất"
            value={monthlyData[maxMonth]?.revenue || 0}
            formatter={(value) => 
              new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                .format(value as number)
            }
          />
        </Col>
      </Row>
    </Card>
  );
};