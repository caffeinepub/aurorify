import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Package, Settings, ShoppingBag, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useActor } from "../hooks/useActor";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatPrice(cents: bigint): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents) / 100);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !isFetching,
  });

  useEffect(() => {
    if (!checkingAdmin && isAdmin === false) navigate({ to: "/" });
  }, [isAdmin, checkingAdmin, navigate]);

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => actor!.listProducts(),
    enabled: !!actor && !isFetching && !!isAdmin,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: () => actor!.listOrders(),
    enabled: !!actor && !isFetching && !!isAdmin,
  });

  if (checkingAdmin || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div data-ocid="admin.loading_state" className="text-center">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 font-body text-muted-foreground">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const totalRevenue =
    orders?.reduce((sum, o) => sum + o.totalAmount, 0n) ?? 0n;
  const recentOrders = orders?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground text-background px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-background/60 hover:text-background transition-colors"
            >
              ← Back to Store
            </Link>
            <span className="text-background/40">|</span>
            <h1 className="font-display font-semibold">Admin Dashboard</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/admin/products"
              data-ocid="admin.products.link"
              className="text-sm text-background/80 hover:text-background transition-colors flex items-center gap-1"
            >
              <Package className="h-4 w-4" /> Products
            </Link>
            <Link
              to="/admin/orders"
              data-ocid="admin.orders.link"
              className="text-sm text-background/80 hover:text-background transition-colors flex items-center gap-1"
            >
              <ShoppingBag className="h-4 w-4" /> Orders
            </Link>
            <Link
              to="/admin/settings"
              data-ocid="admin.settings.link"
              className="text-sm text-background/80 hover:text-background transition-colors flex items-center gap-1"
            >
              <Settings className="h-4 w-4" /> Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Card data-ocid="admin.products.card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="font-display text-3xl font-bold">
                  {products?.length ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
          <Card data-ocid="admin.orders.card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="font-display text-3xl font-bold">
                  {orders?.length ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
          <Card data-ocid="admin.revenue.card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-body text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="font-display text-3xl font-bold">
                  {formatPrice(totalRevenue)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              data-ocid="admin.view_orders.link"
              className="text-sm font-body text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {loadingOrders ? (
              [...Array(3)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))
            ) : recentOrders.length === 0 ? (
              <div
                data-ocid="admin.orders.empty_state"
                className="text-center py-10 text-muted-foreground"
              >
                <p className="font-body">No orders yet.</p>
              </div>
            ) : (
              recentOrders.map((order, i) => (
                <div
                  key={order.id}
                  data-ocid={`admin.order.item.${i + 1}`}
                  className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-body font-medium text-sm">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {order.customerEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-body font-medium">
                      {formatPrice(order.totalAmount)}
                    </p>
                    <Badge
                      className={`text-xs mt-1 ${statusColors[order.status] ?? ""}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
