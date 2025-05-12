import { useQuery } from '@tanstack/react-query';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  createdAt: string;
  status: string;
  items: OrderItem[];
  payment: {
    method: 'mobile-money' | 'card' | 'cash-on-delivery';
    status: 'pending' | 'completed' | 'failed';
  };
  orderType: string;
}

interface ChartData {
  revenueByMonth: Record<string, number>;
  statusDistribution: Record<string, number>;
  paymentMethodDistribution: Record<string, {
    cashOnDelivery: number;
    mobileMoney: number;
    card: number;
  }>;
  topSellingItems: Record<string, number>;
  orderTypeDistribution: Record<string, number>;
  dailyOrders: Record<string, number>;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

async function fetchChartData(): Promise<ChartData> {
  const response = await fetch('https://marketmate-backend.onrender.com/api/orders');
  if (!response.ok) {
    throw new Error('Failed to fetch chart data');
  }
  const orders: Order[] = await response.json();
  
  // Get the last 6 months of data
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const recentOrders = orders.filter(order => 
    new Date(order.createdAt) >= sixMonthsAgo
  );

  // Process payment method distribution
  const paymentMethodDistribution = recentOrders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        cashOnDelivery: 0,
        mobileMoney: 0,
        card: 0
      };
    }
    
    switch (order.payment.method) {
      case 'cash-on-delivery':
        acc[date].cashOnDelivery++;
        break;
      case 'mobile-money':
        acc[date].mobileMoney++;
        break;
      case 'card':
        acc[date].card++;
        break;
    }
    
    return acc;
  }, {} as Record<string, { cashOnDelivery: number; mobileMoney: number; card: number; }>);

  // 1. Revenue Over Time (Line Chart)
  const revenueByMonth = recentOrders.reduce((acc, order) => {
    const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
    acc[month] = (acc[month] || 0) + order.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // 2. Order Status Distribution (Pie Chart)
  const statusDistribution = recentOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 4. Top Selling Items (Bar Chart)
  const itemSales = recentOrders.reduce((acc, order) => {
    order.items.forEach(item => {
      acc[item.name] = (acc[item.name] || 0) + item.quantity;
    });
    return acc;
  }, {} as Record<string, number>);

  const topSellingItems = Object.entries(itemSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .reduce((acc, [name, quantity]) => {
      acc[name] = quantity;
      return acc;
    }, {} as Record<string, number>);

  // 5. Order Type Distribution (Pie Chart)
  const orderTypeDistribution = recentOrders.reduce((acc, order) => {
    acc[order.orderType] = (acc[order.orderType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 6. Daily Order Volume (Line Chart)
  const dailyOrders = recentOrders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    revenueByMonth,
    statusDistribution,
    paymentMethodDistribution,
    topSellingItems,
    orderTypeDistribution,
    dailyOrders,
    totalOrders: recentOrders.length,
    totalRevenue: recentOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: recentOrders.length > 0 
      ? recentOrders.reduce((sum, order) => sum + order.totalAmount, 0) / recentOrders.length 
      : 0
  };
}

export function useChartData() {
  return useQuery({
    queryKey: ['chartData'],
    queryFn: fetchChartData,
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
} 