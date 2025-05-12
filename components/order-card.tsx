import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface OrderCardProps {
  order: {
    _id: string;
    customer: {
      name: string;
      email: string;
      phone: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    status: string;
    payment: {
      status: string;
      method: string;
    };
    createdAt: string;
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const isNew =
    new Date(order.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000; // 24 hours

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Order #{order._id.slice(-6)}
        </CardTitle>
        <div className="flex items-center gap-2">
          {isNew && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 hover:bg-green-100"
            >
              New
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={cn(
              "capitalize",
              order.status === "completed" && "bg-green-100 text-green-800",
              order.status === "pending" && "bg-yellow-100 text-yellow-800",
              order.status === "cancelled" && "bg-red-100 text-red-800"
            )}
          >
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-muted-foreground">{order.customer.email}</p>
          <p className="text-muted-foreground">{order.customer.phone}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
          <p className="text-sm text-muted-foreground">
            Total: GHS {order.totalAmount.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(order.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
