"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  CheckCircle2Icon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrendingUpIcon,
  XCircleIcon,
  ClockIcon,
  XIcon,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog } from "@/components/ui/alert-dialog";

export const schema = z.object({
  _id: z.string(),
  user: z.string(),
  courier: z
    .union([
      z.string(),
      z.object({
        _id: z.string(),
        vehicle: z.object({
          registrationNumber: z.string(),
        }),
        currentLocation: z.object({
          type: z.string(),
          coordinates: z.array(z.number()).optional(),
        }),
        deliveryStats: z.object({
          completed: z.number(),
          failed: z.number(),
        }),
        user: z.object({
          address: z.object({
            country: z.string(),
            street: z.string(),
            region: z.string(),
          }),
          _id: z.string(),
          phoneNumber: z.string(),
          fullName: z.string(),
          profilePicture: z.string(),
          otpVerified: z.boolean(),
          wishlist: z.array(z.any()),
          createdAt: z.string(),
          updatedAt: z.string(),
          __v: z.number(),
        }),
        status: z.string(),
        rating: z.number(),
        earnings: z.number(),
        createdAt: z.string(),
        updatedAt: z.string(),
        __v: z.number(),
      }),
    ])
    .optional(),
  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      quantity: z.number(),
      imageUrl: z.string(),
      discount: z.number(),
      unitOfMeasure: z.string(),
      total: z.number(),
    })
  ),
  totalAmount: z.number(),
  deliveryAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    coordinates: z.array(z.number()),
  }),
  payment: z.object({
    amount: z.number(),
    method: z.string(),
    status: z.string(),
    transactionId: z.string().optional(),
  }),
  specialInstructions: z.string(),
  status: z.string(),
  packagingType: z.string(),
  orderType: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Update the Courier type to match the API response
type Courier = {
  _id: string;
  vehicle: {
    registrationNumber: string;
  };
  currentLocation: {
    type: string;
    coordinates?: number[];
  };
  deliveryStats: {
    completed: number;
    failed: number;
  };
  user: {
    address: {
      country: string;
      street: string;
      region: string;
    };
    _id: string;
    phoneNumber: string;
    fullName: string;
    profilePicture: string;
    otpVerified: boolean;
    wishlist: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  status: string;
  rating: number;
  earnings: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original._id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "_id",
    header: "Order ID",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "payment.method",
    header: "Payment Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.payment.method}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusConfig = {
        confirmed: {
          icon: <LoaderIcon className="text-blue-500 dark:text-blue-400" />,
          label: "Confirmed",
          className:
            "bg-blue-50/0.5 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
        },
        dispatched: {
          icon: (
            <TrendingUpIcon className="text-orange-500 dark:text-orange-400" />
          ),
          label: "Dispatched",
          className:
            "bg-orange-50/0.5 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400",
        },
        delivered: {
          icon: (
            <CheckCircle2Icon className="text-green-500 dark:text-green-400" />
          ),
          label: "Delivered",
          className:
            "bg-green-50/0.5 text-green-700 dark:bg-green-950/50 dark:text-green-400",
        },
        failed: {
          icon: <XCircleIcon className="text-red-500 dark:text-red-400" />,
          label: "Failed",
          className:
            "bg-red-50/0.5 text-red-700 dark:bg-red-950/50 dark:text-red-400",
        },
        pending: {
          icon: <ClockIcon className="text-gray-500 dark:text-gray-400" />,
          label: "Pending",
          className:
            "bg-gray-50/0.5 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400",
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        icon: <LoaderIcon className="text-gray-500 dark:text-gray-400" />,
        label: status,
        className:
          "bg-gray-50/0.5 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400",
      };

      return (
        <Badge
          variant="outline"
          className={`flex w-fit items-center gap-1.5 px-2.5 py-1 ${config.className}`}
        >
          {config.icon}
          <span className="capitalize">{config.label}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="w-full text-right">Total Amount</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        GHS {row.original.payment.amount.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "packagingType",
    header: () => <div className="w-full text-right">Packaging</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.original.packagingType}</div>
    ),
  },
  {
    accessorKey: "courier",
    header: "Courier",
    cell: ({ row }) => {
      const courier = row.original.courier;
      const { data: couriersResponse } = useQuery<{ couriers: Courier[] }>({
        queryKey: ["couriers"],
        queryFn: async () => {
          const response = await fetch(
            "https://marketmate-backend.onrender.com/api/auth/couriers"
          );
          if (!response.ok) {
            throw new Error("Failed to fetch couriers");
          }
          return response.json();
        },
      });

      const couriers = couriersResponse?.couriers || [];
      const [isAssigning, setIsAssigning] = React.useState(false);
      const [selectedCourier, setSelectedCourier] = React.useState<
        string | null
      >(null);
      const [showConfirmDialog, setShowConfirmDialog] = React.useState(false);
      const queryClient = useQueryClient();

      const handleCourierAssign = async (courierId: string) => {
        try {
          setIsAssigning(true);
          const response = await fetch(
            `https://marketmate-backend.onrender.com/api/orders/assign/${row.original._id}/${courierId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to assign courier");
          }

          toast.success("Courier assigned successfully");
          queryClient.invalidateQueries({ queryKey: ["orders"] });
        } catch (error) {
          console.error("Error assigning courier:", error);
          toast.error(
            error instanceof Error ? error.message : "Failed to assign courier"
          );
        } finally {
          setIsAssigning(false);
          setShowConfirmDialog(false);
          setSelectedCourier(null);
        }
      };

      const handleCourierSelect = (courierId: string) => {
        setSelectedCourier(courierId);
        setShowConfirmDialog(true);
      };

      const getCourierDisplay = (courierData: string | Courier | undefined) => {
        if (!courierData) return null;

        if (typeof courierData === "object" && courierData !== null) {
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={courierData.user?.profilePicture} />
                <AvatarFallback>
                  {courierData.user?.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {courierData.user?.fullName || "Unknown Courier"}
              </span>
            </div>
          );
        }

        const courierObj = couriers.find((c) => c._id === courierData);
        if (!courierObj) return "Unknown Courier";

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={courierObj.user.profilePicture} />
              <AvatarFallback>
                {courierObj.user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{courierObj.user.fullName}</span>
          </div>
        );
      };

      const selectedCourierData = selectedCourier
        ? couriers.find((c) => c._id === selectedCourier)
        : null;

      return (
        <>
          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
            title="Confirm Courier Assignment"
            description={
              <div className="space-y-4">
                <p>
                  {courier
                    ? "Are you sure you want to change the assigned courier?"
                    : "Are you sure you want to assign this courier to the order?"}
                </p>
                {selectedCourierData && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={selectedCourierData.user.profilePicture}
                      />
                      <AvatarFallback>
                        {selectedCourierData.user.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {selectedCourierData.user.fullName}
                      </span>
                      <div className="flex gap-2 text-sm text-muted-foreground">
                        <span>
                          Completed:{" "}
                          {selectedCourierData.deliveryStats.completed}
                        </span>
                        <span>•</span>
                        <span>
                          Failed: {selectedCourierData.deliveryStats.failed}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            }
            onConfirm={() =>
              selectedCourier && handleCourierAssign(selectedCourier)
            }
            isLoading={isAssigning}
            confirmText={isAssigning ? "Assigning..." : "Assign Courier"}
          />

          <div className="flex items-center gap-2">
            {getCourierDisplay(courier)}
            <Select
              disabled={isAssigning}
              onValueChange={handleCourierSelect}
              value={typeof courier === "object" ? courier?._id : courier}
            >
              <SelectTrigger
                className="h-8 w-40"
                id={`${row.original._id}-courier`}
              >
                <SelectValue
                  placeholder={isAssigning ? "Assigning..." : "Change courier"}
                />
              </SelectTrigger>
              <SelectContent align="end">
                {couriers.map((courier) => (
                  <SelectItem key={courier._id} value={courier._id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={courier.user.profilePicture} />
                        <AvatarFallback>
                          {courier.user.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {courier.user.fullName}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      );
    },
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable() {
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await fetch(
        "https://marketmate-backend.onrender.com/api/orders"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      // Sort orders by createdAt in descending order (latest first)
      return data.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  });

  const { data: couriers, isLoading: couriersLoading } = useQuery<Courier[]>({
    queryKey: ["couriers"],
    queryFn: async () => {
      const response = await fetch(
        "https://marketmate-backend.onrender.com/api/auth/couriers"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch couriers");
      }
      return response.json();
    },
  });

  const [data, setData] = React.useState<z.infer<typeof schema>[]>(
    () => orders || []
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map((item) => item._id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row._id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    if (orders) {
      // Ensure data is sorted when orders are updated
      const sortedOrders = [...orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setData(sortedOrders);
    }
  }, [orders]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((currentData) => {
        const oldIndex = dataIds.indexOf(active.id as string);
        const newIndex = dataIds.indexOf(over.id as string);
        return arrayMove(currentData, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs
      defaultValue="outline"
      className="flex w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex flex-1 items-center gap-4">
            <Input
              placeholder="Search orders..."
              value={(table.getColumn("_id")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("_id")?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            <Select
              value={
                (table.getColumn("status")?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(value) =>
                table
                  .getColumn("status")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={
                (table
                  .getColumn("payment.method")
                  ?.getFilterValue() as string) ?? "all"
              }
              onValueChange={(value) =>
                table
                  .getColumn("payment.method")
                  ?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="mobile-money">Mobile Money</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="cash-on-delivery">
                  Cash on Delivery
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
              }}
              className="h-9 px-2 lg:px-3"
            >
              Reset
              <XIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <PlusIcon />
            <span className="hidden lg:inline">Add Section</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.original._id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="past-performance"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent value="key-personnel" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
      <TabsContent
        value="focus-documents"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed"></div>
      </TabsContent>
    </Tabs>
  );
}

const chartData = [];
const chartConfig = {};

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const isMobile = useIsMobile();
  const { data: couriersResponse } = useQuery<{ couriers: Courier[] }>({
    queryKey: ["couriers"],
    queryFn: async () => {
      const response = await fetch(
        "https://marketmate-backend.onrender.com/api/auth/couriers"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch couriers");
      }
      return response.json();
    },
  });

  const couriers = couriersResponse?.couriers || [];

  // Get the courier name for display
  const getCourierName = (courier: string | Courier | undefined) => {
    if (!courier) return "No Courier Assigned";
    if (typeof courier === "object" && courier !== null) {
      return courier.user?.fullName || "Unknown Courier";
    }
    const courierObj = couriers.find((c) => c._id === courier);
    return courierObj ? courierObj.user.fullName : "Unknown Courier";
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground">
          {item._id}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>Order ID: {item._id}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          {!isMobile && (
            <>
              <div className="grid gap-2">
                <div className="flex gap-2 font-medium leading-none">
                  Order Status: {item.status}
                </div>
                <div className="text-muted-foreground">
                  Total Amount: GHS {item.payment.amount.toFixed(2)}
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue={item.status}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="payment">Payment Method</Label>
                <Select defaultValue={item.payment.method}>
                  <SelectTrigger id="payment" className="w-full">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile-money">Mobile Money</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cash-on-delivery">
                      Cash on Delivery
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="packaging">Packaging Type</Label>
                <Select defaultValue={item.packagingType}>
                  <SelectTrigger id="packaging" className="w-full">
                    <SelectValue placeholder="Select packaging type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="fragile">Fragile</SelectItem>
                    <SelectItem value="refrigerated">Refrigerated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="courier">Courier</Label>
              <Select
                defaultValue={
                  typeof item.courier === "object"
                    ? item.courier?._id
                    : item.courier
                }
              >
                <SelectTrigger id="courier" className="w-full">
                  <SelectValue placeholder="Select a courier" />
                </SelectTrigger>
                <SelectContent>
                  {couriers.map((courier) => (
                    <SelectItem key={courier._id} value={courier._id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={courier.user.profilePicture} />
                          <AvatarFallback>
                            {courier.user.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        {courier.user.fullName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>
        </div>
        <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
          <Button className="w-full">Update Order</Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
