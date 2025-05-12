"use client";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

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
    status: string;
  };
}

export function SectionCards() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["dashbord"],
    queryFn: () =>
      fetch("https://marketmate-backend.onrender.com/api/orders").then((res) =>
        res.json()
      ),
  });
  console.log(orders);
  const calculateStats = () => {
    if (!orders) return null;

    // Calculate total revenue (only from completed payments)
    const totalRevenue = orders
      .filter((order) => order.payment.status === "completed")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate percentage change
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentMonthOrders = orders.filter(
      (order) =>
        new Date(order.createdAt).getMonth() === currentMonth &&
        order.payment.status === "completed"
    );
    const previousMonthOrders = orders.filter(
      (order) =>
        new Date(order.createdAt).getMonth() === previousMonth &&
        order.payment.status === "completed"
    );

    const currentMonthRevenue = currentMonthOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const previousMonthRevenue = previousMonthOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const percentageChange =
      previousMonthRevenue === 0
        ? 100
        : ((currentMonthRevenue - previousMonthRevenue) /
            previousMonthRevenue) *
          100;

    return {
      totalRevenue,
      percentageChange: Number(percentageChange.toFixed(1)),
      isPositive: percentageChange >= 0,
    };
  };

  const calculateActiveOrders = () => {
    if (!orders) return null;

    const activeStatuses = ["confirmed", "in-progress", "processing"];
    const activeOrders = orders.filter((order) =>
      activeStatuses.includes(order.status)
    );

    // Calculate percentage change in active orders
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentMonthActive = orders.filter(
      (order) =>
        new Date(order.createdAt).getMonth() === currentMonth &&
        activeStatuses.includes(order.status)
    ).length;

    const previousMonthActive = orders.filter(
      (order) =>
        new Date(order.createdAt).getMonth() === previousMonth &&
        activeStatuses.includes(order.status)
    ).length;

    const percentageChange =
      previousMonthActive === 0
        ? 100
        : ((currentMonthActive - previousMonthActive) / previousMonthActive) *
          100;

    return {
      count: activeOrders.length,
      percentageChange: Number(percentageChange.toFixed(1)),
      isPositive: percentageChange >= 0,
    };
  };

  const calculatePopularItems = () => {
    if (!orders) return null;

    // Count item occurrences across all orders
    const itemCounts = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    // Get the most popular item
    const mostPopularItem = Object.entries(itemCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    // Calculate percentage change in popularity
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentMonthCount = orders
      .filter((order) => new Date(order.createdAt).getMonth() === currentMonth)
      .reduce((acc, order) => {
        const item = order.items.find((i) => i.name === mostPopularItem[0]);
        return acc + (item?.quantity || 0);
      }, 0);

    const previousMonthCount = orders
      .filter((order) => new Date(order.createdAt).getMonth() === previousMonth)
      .reduce((acc, order) => {
        const item = order.items.find((i) => i.name === mostPopularItem[0]);
        return acc + (item?.quantity || 0);
      }, 0);

    const percentageChange =
      previousMonthCount === 0
        ? 100
        : ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

    return {
      itemName: mostPopularItem[0],
      totalQuantity: mostPopularItem[1],
      percentageChange: Number(percentageChange.toFixed(1)),
      isPositive: percentageChange >= 0,
    };
  };

  const calculateDeliverySuccess = () => {
    if (!orders) return null;

    const successfulStatuses = ["delivered", "completed"];
    const failedStatuses = ["failed", "cancelled", "returned"];

    // Calculate current month's success rate
    const now = new Date();
    const currentMonth = now.getMonth();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const currentMonthOrders = orders.filter(
      (order) => new Date(order.createdAt).getMonth() === currentMonth
    );

    const currentMonthSuccessful = currentMonthOrders.filter((order) =>
      successfulStatuses.includes(order.status)
    ).length;

    const currentMonthFailed = currentMonthOrders.filter((order) =>
      failedStatuses.includes(order.status)
    ).length;

    const currentMonthTotal = currentMonthSuccessful + currentMonthFailed;
    const currentSuccessRate =
      currentMonthTotal === 0
        ? 0
        : (currentMonthSuccessful / currentMonthTotal) * 100;

    // Calculate previous month's success rate
    const previousMonthOrders = orders.filter(
      (order) => new Date(order.createdAt).getMonth() === previousMonth
    );

    const previousMonthSuccessful = previousMonthOrders.filter((order) =>
      successfulStatuses.includes(order.status)
    ).length;

    const previousMonthFailed = previousMonthOrders.filter((order) =>
      failedStatuses.includes(order.status)
    ).length;

    const previousMonthTotal = previousMonthSuccessful + previousMonthFailed;
    const previousSuccessRate =
      previousMonthTotal === 0
        ? 0
        : (previousMonthSuccessful / previousMonthTotal) * 100;

    const percentageChange =
      previousSuccessRate === 0
        ? 100
        : ((currentSuccessRate - previousSuccessRate) / previousSuccessRate) *
          100;

    return {
      successRate: Number(currentSuccessRate.toFixed(1)),
      percentageChange: Number(percentageChange.toFixed(1)),
      isPositive: percentageChange >= 0,
      totalDeliveries: currentMonthTotal,
    };
  };

  const stats = calculateStats();
  const activeStats = calculateActiveOrders();
  const popularStats = calculatePopularItems();
  const deliveryStats = calculateDeliverySuccess();

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading
              ? "Loading..."
              : stats
              ? `GHS ${stats.totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "GHS 0.00"}
          </CardTitle>
          <CardAction>
            {stats && (
              <Badge variant="outline">
                {stats.isPositive ? <IconTrendingUp /> : <IconTrendingDown />}
                {stats.percentageChange > 0 ? "+" : ""}
                {stats.percentageChange}%
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {stats && (
            <>
              <div className="line-clamp-1 flex gap-2 font-medium">
                {stats.isPositive ? "Trending up" : "Trending down"} this month
                {stats.isPositive ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
              </div>
              <div className="text-muted-foreground">
                Compared to previous month
              </div>
            </>
          )}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading
              ? "Loading..."
              : activeStats
              ? activeStats.count.toLocaleString()
              : "0"}
          </CardTitle>
          <CardAction>
            {activeStats && (
              <Badge variant="outline">
                {activeStats.isPositive ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {activeStats.percentageChange > 0 ? "+" : ""}
                {activeStats.percentageChange}%
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {activeStats && (
            <>
              <div className="line-clamp-1 flex gap-2 font-medium">
                {activeStats.isPositive
                  ? "More active orders"
                  : "Fewer active orders"}{" "}
                this month
                {activeStats.isPositive ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
              </div>
              <div className="text-muted-foreground">
                Compared to previous month
              </div>
            </>
          )}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Most Popular Item</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading
              ? "Loading..."
              : popularStats
              ? popularStats.itemName
              : "No data"}
          </CardTitle>
          <CardAction>
            {popularStats && (
              <Badge variant="outline">
                {popularStats.isPositive ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {popularStats.percentageChange > 0 ? "+" : ""}
                {popularStats.percentageChange}%
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {popularStats && (
            <>
              <div className="line-clamp-1 flex gap-2 font-medium">
                {popularStats.totalQuantity} units sold this month
                {popularStats.isPositive ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
              </div>
              <div className="text-muted-foreground">
                Compared to previous month
              </div>
            </>
          )}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Delivery Success Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading
              ? "Loading..."
              : deliveryStats
              ? `${deliveryStats.successRate}%`
              : "0%"}
          </CardTitle>
          <CardAction>
            {deliveryStats && (
              <Badge variant="outline">
                {deliveryStats.isPositive ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {deliveryStats.percentageChange > 0 ? "+" : ""}
                {deliveryStats.percentageChange}%
              </Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {deliveryStats && (
            <>
              <div className="line-clamp-1 flex gap-2 font-medium">
                {deliveryStats.isPositive ? "Improved" : "Decreased"} delivery
                success
                {deliveryStats.isPositive ? (
                  <IconTrendingUp className="size-4" />
                ) : (
                  <IconTrendingDown className="size-4" />
                )}
              </div>
              <div className="text-muted-foreground">
                {deliveryStats.totalDeliveries} deliveries this month
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
