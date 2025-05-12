import { useQuery } from '@tanstack/react-query';

interface Order {
  id: string;
  amount: number;
  createdAt: string;
}

interface OrderStats {
  totalRevenue: number;
  percentageChange: number;
  isPositive: boolean;
}

async function fetchOrders(): Promise<Order[]> {
  const response = await fetch('/api/orders');
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  return response.json();
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['orderStats'],
    queryFn: async (): Promise<OrderStats> => {
      const orders = await fetchOrders();
      
      // Calculate total revenue
      const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
      
      // Calculate percentage change (comparing current month with previous month)
      const now = new Date();
      const currentMonth = now.getMonth();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      
      const currentMonthOrders = orders.filter(order => 
        new Date(order.createdAt).getMonth() === currentMonth
      );
      const previousMonthOrders = orders.filter(order => 
        new Date(order.createdAt).getMonth() === previousMonth
      );
      
      const currentMonthRevenue = currentMonthOrders.reduce((sum, order) => sum + order.amount, 0);
      const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.amount, 0);
      
      const percentageChange = previousMonthRevenue === 0 
        ? 100 
        : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
      
      return {
        totalRevenue,
        percentageChange: Number(percentageChange.toFixed(1)),
        isPositive: percentageChange >= 0
      };
    }
  });
} 