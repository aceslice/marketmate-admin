import { useQuery } from '@tanstack/react-query';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  discount: number;
  unitOfMeasure: string;
  total: number;
}

interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface Payment {
  _id: string;
  amount: number;
  method: 'mobile-money' | 'card' | 'cash-on-delivery';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
}

interface Courier {
  _id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'offline';
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  courier?: Courier;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  payment: Payment;
  specialInstructions: string;
  status: 'confirmed' | 'dispatched' | 'delivered' | 'failed';
  packagingType: 'standard' | 'fragile' | 'refrigerated';
  orderType: 'instant' | 'scheduled';
  createdAt: string;
  updatedAt: string;
}

interface ProcessedOrder {
  _id: string;
  customer: string;
  courier: string;
  items: string;
  total: number;
  status: string;
  date: string;
  payment: string;
  courierId?: string;
}

// Mock courier data
const mockCouriers: Courier[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'John Doe',
    phone: '+233 20 123 4567',
    email: 'john.doe@example.com',
    status: 'available'
  },
  {
    _id: '507f1f77bcf86cd799439012',
    name: 'Jane Smith',
    phone: '+233 20 234 5678',
    email: 'jane.smith@example.com',
    status: 'available'
  },
  {
    _id: '507f1f77bcf86cd799439013',
    name: 'Mike Johnson',
    phone: '+233 20 345 6789',
    email: 'mike.johnson@example.com',
    status: 'busy'
  }
];

async function fetchOrders(): Promise<ProcessedOrder[]> {
  try {
    const response = await fetch('https://marketmate-backend.onrender.com/api/orders', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || `Failed to fetch orders: ${response.statusText}`);
    }

    const orders: Order[] = await response.json();

    return orders.map(order => ({
      _id: order._id || 'N/A',
      customer: order.user?.name || 'Unknown Customer',
      courier: order.courier?.name || 'Not Assigned',
      courierId: order.courier?._id,
      items: order.items?.length.toString() || '0',
      total: order.totalAmount || 0,
      status: order.status || 'confirmed',
      date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
      payment: order.payment?.method || 'Not Specified'
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch when network reconnects
  });
}

// Export mock couriers for use in the data table
export { mockCouriers }; 