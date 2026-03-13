import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "../backend.d";
import { useActor } from "../hooks/useActor";

function formatPrice(cents: bigint): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents) / 100);
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor, isFetching } = useActor();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    if (!checkingAdmin && isAdmin === false) navigate({ to: "/" });
  }, [isAdmin, checkingAdmin, navigate]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => actor!.listOrders(),
    enabled: !!actor && !isFetching && !!isAdmin,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => {
      if (!actor) throw new Error("Not ready");
      return actor.updateOrderStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update order status"),
  });

  if (checkingAdmin || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground text-background px-6 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link
            to="/admin"
            className="text-background/60 hover:text-background transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="font-display font-semibold">Orders</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div
            data-ocid="admin.orders.loading_state"
            className="text-center py-20"
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (orders?.length ?? 0) === 0 ? (
          <div
            data-ocid="admin.orders.empty_state"
            className="text-center py-20"
          >
            <p className="font-display text-xl text-muted-foreground">
              No orders yet
            </p>
          </div>
        ) : (
          <div
            data-ocid="admin.orders.table"
            className="rounded-lg border border-border overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order, i) => (
                  <TableRow
                    key={order.id}
                    data-ocid={`admin.order.row.${i + 1}`}
                  >
                    <TableCell>
                      <div>
                        <p className="font-body font-medium text-sm">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground font-body">
                          {order.customerEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-body text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="font-body text-sm">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "items"}
                    </TableCell>
                    <TableCell className="font-body font-medium">
                      {formatPrice(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(v) =>
                          statusMutation.mutate({
                            id: order.id,
                            status: v as OrderStatus,
                          })
                        }
                      >
                        <SelectTrigger
                          data-ocid={`admin.order.status.select.${i + 1}`}
                          className="w-32 h-8 text-xs"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
