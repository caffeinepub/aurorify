import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { OrderItem, ShippingAddress } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";

export default function OrderConfirmationPage() {
  const search = useSearch({ from: "/order-confirmation" }) as {
    session_id?: string;
  };
  const { items, clearCart } = useCart();
  const { actor, isFetching } = useActor();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [orderId, setOrderId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const processedRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run once when actor is ready
  useEffect(() => {
    if (!actor || isFetching || processedRef.current) return;
    processedRef.current = true;

    const sessionId = search.session_id;
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("No session ID found.");
      return;
    }

    const process = async () => {
      try {
        const result = await actor.getStripeSessionStatus(sessionId);
        if (result.__kind__ === "completed") {
          const pendingRaw = sessionStorage.getItem("pendingOrder");
          const pending = pendingRaw ? JSON.parse(pendingRaw) : {};

          const shippingAddress: ShippingAddress = {
            street: pending.street ?? "",
            city: pending.city ?? "",
            state: pending.state ?? "",
            zip: pending.zip ?? "",
            country: pending.country ?? "",
          };

          const orderItems: OrderItem[] = items.map((i) => ({
            productId: i.product.id,
            quantity: BigInt(i.quantity),
            priceAtPurchase: i.product.price,
          }));

          const id = await actor.createOrder(
            pending.customerName ?? "",
            pending.customerEmail ?? "",
            shippingAddress,
            orderItems,
            sessionId,
          );
          setOrderId(id);
          clearCart();
          sessionStorage.removeItem("pendingOrder");
          setStatus("success");
        } else {
          setStatus("error");
          setErrorMsg(result.failed.error);
        }
      } catch {
        setStatus("error");
        setErrorMsg("An error occurred while processing your order.");
      }
    };

    process();
  }, [actor, isFetching]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        {status === "loading" && (
          <motion.div
            data-ocid="order.loading_state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="font-display text-xl">Processing your order...</p>
            <p className="font-body text-muted-foreground">
              Please wait while we confirm your payment.
            </p>
          </motion.div>
        )}
        {status === "success" && (
          <motion.div
            data-ocid="order.success_state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold">
                Order Confirmed!
              </h1>
              <p className="font-body text-muted-foreground mt-2">
                Thank you for your purchase. Your order has been placed
                successfully.
              </p>
              {orderId && (
                <p className="font-body text-sm mt-2">
                  Order ID:{" "}
                  <span className="font-mono font-medium text-foreground">
                    {orderId}
                  </span>
                </p>
              )}
            </div>
            <Button asChild data-ocid="order.shop_again.button">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </motion.div>
        )}
        {status === "error" && (
          <motion.div
            data-ocid="order.error_state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 max-w-md"
          >
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-semibold">
                Payment Failed
              </h1>
              <p className="font-body text-muted-foreground mt-2">{errorMsg}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild data-ocid="order.retry.button">
                <Link to="/checkout">Try Again</Link>
              </Button>
              <Button asChild>
                <Link to="/shop">Back to Shop</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
