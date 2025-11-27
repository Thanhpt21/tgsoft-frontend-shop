// app/admin/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, DatePicker, Statistic, Select, Spin, Alert, Tag } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  DollarCircleOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import moment, { Moment } from 'moment';
import 'moment/locale/vi';

// Import custom hooks
import { useAllProducts } from '@/hooks/product/useAllProducts';
import { useAllUsers } from '@/hooks/user/useAllUsers';
import { useAllCategories } from '@/hooks/category/useAllCategories';
import { useDashboardStatistics } from '@/hooks/order/useDashboardStatistics';
import { useOrderRevenue } from '@/hooks/order/useOrderRevenue';
import { useOrderCount } from '@/hooks/order/useOrderCount';
import { useSalesStatistics } from '@/hooks/order/useSalesStatistics';
import { useMonthlyRevenue } from '@/hooks/order/useMonthlyRevenue';
import { MonthlyRevenueChart } from '@/components/admin/chart/MonthlyRevenueChart';
import { SimplePieChart } from '@/components/admin/chart/SimplePieChart';
import { SimpleBarChart } from '@/components/admin/chart/SimpleBarChart';
import { SimpleLineChart } from '@/components/admin/chart/SimpleLineChart';
import { Category } from '@/types/category.type';
import { Product } from '@/types/product.type';

// Import components


interface CategoryStats {
  id: number;
  name: string;
  value: number; // Cho PieChart
  productCount: number;
  thumbnail?: string | null;
}

const { RangePicker } = DatePicker;
const { Option } = Select;

type RangeValue = [Moment | null, Moment | null] | null;

// Hàm lấy màu theo trạng thái OrderStatus
function getStatusColor(status: string) {
  switch (status) {
    case 'DRAFT': return '#d9d9d9';
    case 'PAID_PENDING': return '#faad14';
    case 'PAID': return '#52c41a';
    case 'PROCESSING': return '#1890ff';
    case 'SHIPPED': return '#722ed1';
    case 'DELIVERED': return '#13c2c2';
    case 'CANCELLED': return '#f5222d';
    case 'REFUNDED': return '#fa541c';
    default: return '#d9d9d9';
  }
}

// Hàm chuyển đổi tên trạng thái sang tiếng Việt
function getStatusLabel(status: string) {
  switch (status) {
    case 'DRAFT': return 'Nháp';
    case 'PAID_PENDING': return 'Chờ thanh toán';
    case 'PAID': return 'Đã thanh toán';
    case 'PROCESSING': return 'Đang xử lý';
    case 'SHIPPED': return 'Đang giao hàng';
    case 'DELIVERED': return 'Giao hàng thành công';
    case 'CANCELLED': return 'Đã hủy';
    case 'REFUNDED': return 'Đã hoàn tiền';
    default: return status;
  }
}

export default function AdminPage() {
  const [dateRange, setDateRange] = useState<RangeValue>([
    moment().startOf('month'),
    moment().endOf('month')
  ]);
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [mounted, setMounted] = useState(false);

  // Sử dụng hooks thực tế
  const { 
    data: productsData = [], 
    isLoading: productsLoading, 
    error: productsError 
  } = useAllProducts();

  const { 
    data: usersData = [], 
    isLoading: usersLoading, 
    error: usersError 
  } = useAllUsers();

  const { 
    data: categoriesData = [], 
    isLoading: categoriesLoading, 
    error: categoriesError 
  } = useAllCategories();

  // Sử dụng hooks thống kê đơn hàng
  const {
    data: dashboardStats,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useDashboardStatistics(timeFilter);

  const {
    data: revenueStats,
    isLoading: revenueLoading
  } = useOrderRevenue({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD'),
    status: 'DELIVERED'
  });

  const {
    data: orderCountStats,
    isLoading: orderCountLoading
  } = useOrderCount({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD')
  });

  const {
    data: salesStats,
    isLoading: salesLoading
  } = useSalesStatistics({
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD')
  });

  const {
    data: monthlyRevenueData,
    isLoading: monthlyRevenueLoading
  } = useMonthlyRevenue(2025);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDateChange = (values: RangeValue, dateStrings: [string, string]) => {
    setDateRange(values);
  };

  const handleTimeFilterChange = (value: 'day' | 'week' | 'month' | 'year') => {
    setTimeFilter(value);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ';
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? '#3f8600' : '#cf1322';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <RiseOutlined /> : <FallOutlined />;
  };

  // Tính toán dữ liệu thực tế từ hooks
  const totalProducts = productsData.length || 0;
  const totalUsers = usersData.length || 0;
  const totalCategories = categoriesData.length || 0;

  // Dữ liệu thống kê thực tế từ APIs
  const totalRevenue = revenueStats?.totalRevenue || 0;
  const totalOrders = orderCountStats?.totalOrders || 0;
  const successRate = salesStats?.summary.successRate || 0;
  const revenueGrowth = dashboardStats?.periodComparison.revenueGrowth || 0;
  const orderGrowth = dashboardStats?.periodComparison.orderGrowth || 0;
  const averageOrderValue = dashboardStats?.averageOrderValue || 0;

  
// Tính toán phân bổ danh mục từ products và categories
  const categoryStats = useMemo(() => {
    if (!productsData.length || !categoriesData.length) {
      return [];
    }

    // Đếm số sản phẩm theo từng category
    const productCountByCategory: { [key: number]: number } = {};
    
    productsData.forEach((product: Product) => {
      if (product.categoryId) {
        productCountByCategory[product.categoryId] = 
          (productCountByCategory[product.categoryId] || 0) + 1;
      }
    });

    // Tạo mảng category stats với type phù hợp
    const stats = categoriesData.map((category: Category) => {
      const productCount = productCountByCategory[category.id] || 0;
      
      return {
        id: category.id,
        name: category.name,
        value: productCount, // Thêm trường value cho PieChart
        productCount: productCount,
        thumbnail: category.thumb
      };
    });

    // Filter trên stats (đã có trường value) thay vì Category
    return stats.filter((category: CategoryStats) => category.value > 0); // Chỉ hiển thị danh mục có sản phẩm
  }, [productsData, categoriesData]);

  // Thống kê trạng thái đơn hàng thực tế
  const orderStatusStats = salesStats?.breakdown.byStatus
    .filter(item => item.orderCount > 0)
    .map(item => ({
      status: item.status,
      label: getStatusLabel(item.status),
      count: item.orderCount,
      revenue: item.revenue,
      color: getStatusColor(item.status)
    })) || [];

  const allStatuses = [
    'DRAFT', 'PAID_PENDING', 'PAID', 'PROCESSING', 
    'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
  ];

  const completeOrderStatusStats = allStatuses.map(status => {
    const existing = orderStatusStats.find(item => item.status === status);
    return existing || {
      status,
      label: getStatusLabel(status),
      count: 0,
      revenue: 0,
      color: getStatusColor(status)
    };
  });

  const isLoading = productsLoading || usersLoading || categoriesLoading || 
                   dashboardLoading || revenueLoading || orderCountLoading || 
                   salesLoading || monthlyRevenueLoading;
  
  const hasError = productsError || usersError || categoriesError || dashboardError;

  if (!mounted || isLoading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-96">
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="p-8">
        <Alert
          message="Lỗi tải dữ liệu"
          description="Không thể tải dữ liệu thống kê. Vui lòng thử lại sau."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tổng Quan Hệ Thống</h1>
        {/* <div className="flex gap-4">
          <Select 
            value={timeFilter} 
            onChange={handleTimeFilterChange}
            className="w-32"
          >
            <Option value="day">Theo ngày</Option>
            <Option value="week">Theo tuần</Option>
            <Option value="month">Theo tháng</Option>
            <Option value="year">Theo năm</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            format="DD/MM/YYYY"
            className="w-64"
          />
        </div> */}
      </div>

      {/* Thống kê tổng quan với dữ liệu thực tế */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={totalProducts}
              prefix={<ShoppingCartOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="flex items-center mt-2 text-sm">
              <Tag color="blue" className="mr-2">
                {totalCategories} danh mục
              </Tag>
              <span className="text-gray-500">đang hoạt động</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={totalUsers}
              prefix={<UserOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="flex items-center mt-2 text-sm">
              <span className={`mr-1 ${orderGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getGrowthIcon(orderGrowth)}
              </span>
              <span style={{ color: getGrowthColor(orderGrowth) }}>
                {Math.abs(orderGrowth)}%
              </span>
              <span className="text-gray-500 ml-1">so với kỳ trước</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng đơn hàng"
              value={totalOrders}
              prefix={<FileTextOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-500">
                Tỷ lệ thành công: <strong>{successRate}%</strong>
              </span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              formatter={(value) => formatCurrency(value as number)}
              prefix={<DollarCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div className="flex items-center mt-2 text-sm">
              <span className={`mr-1 ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {getGrowthIcon(revenueGrowth)}
              </span>
              <span style={{ color: getGrowthColor(revenueGrowth) }}>
                {Math.abs(revenueGrowth)}%
              </span>
              <span className="text-gray-500 ml-1">so với kỳ trước</span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Thống kê chi tiết */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Giá trị đơn hàng trung bình"
              value={averageOrderValue}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tỷ lệ thành công"
              value={successRate}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tăng trưởng doanh thu"
              value={revenueGrowth}
              suffix="%"
              valueStyle={{ color: getGrowthColor(revenueGrowth) }}
              prefix={getGrowthIcon(revenueGrowth)}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ với dữ liệu THẬT */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <MonthlyRevenueChart 
            year={2025}
            height={500}
          />
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Phân bổ danh mục sản phẩm" className="h-96">
            {categoryStats.length > 0 ? (
              <>
                <SimplePieChart
                  data={categoryStats.map((item: any) => item.value)}
                  labels={categoryStats.map((item: any) => item.name)}
                  colors={['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#fa541c', '#13c2c2']}
                />
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Tổng số: <strong>{totalCategories}</strong> danh mục
                  </div>
                  <div className="text-sm text-gray-600">
                    Quản lý: <strong>{totalProducts}</strong> sản phẩm
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-32">
                <span className="text-gray-500">Chưa có dữ liệu danh mục</span>
              </div>
            )}
          </Card>
        </Col>
      </Row>


      {/* Thống kê trạng thái đơn hàng thực tế */}
      {completeOrderStatusStats.length > 0 && (
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24}>
            <Card title="Thống kê trạng thái đơn hàng">
              <Row gutter={[16, 16]}>
                {completeOrderStatusStats.map((item, index) => (
                  <Col xs={24} sm={6} md={4} lg={3} key={index}>
                    <div 
                      className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      style={{ borderLeft: `4px solid ${item.color}` }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="text-2xl font-bold text-gray-800">
                        {item.count}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">
                        {item.label}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {formatCurrency(item.revenue)}
                      </div>
                      {item.count > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          {((item.count / totalOrders) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </Col>
                ))}
              </Row>
              
              {/* Tổng kết */}
              <div className="mt-6 pt-4 border-t">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-800">{totalOrders}</div>
                      <div className="text-sm text-gray-600">Tổng số đơn hàng</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {completeOrderStatusStats.find(s => s.status === 'DELIVERED')?.count || 0}
                      </div>
                      <div className="text-sm text-gray-600">Đơn hàng thành công</div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">
                        {completeOrderStatusStats.find(s => s.status === 'CANCELLED')?.count || 0}
                      </div>
                      <div className="text-sm text-gray-600">Đơn hàng đã hủy</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tổng kết hiệu suất */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24}>
          <Card title="Tổng kết hiệu suất">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {successRate}%
                  </div>
                  <div className="text-gray-600">Tỷ lệ đơn hàng thành công</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(averageOrderValue)}
                  </div>
                  <div className="text-gray-600">Giá trị đơn hàng trung bình</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {revenueGrowth}%
                  </div>
                  <div className="text-gray-600">Tăng trưởng doanh thu</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}