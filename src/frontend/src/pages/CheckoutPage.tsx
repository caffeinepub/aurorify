import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ShoppingItem } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";

interface CheckoutForm {
  customerName: string;
  customerEmail: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

function formatPrice(cents: bigint): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents) / 100);
}

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const { actor, isFetching } = useActor();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutForm>();

  const { data: stripeConfigured, isLoading: checkingStripe } = useQuery({
    queryKey: ["stripeConfigured"],
    queryFn: () => actor!.isStripeConfigured(),
    enabled: !!actor && !isFetching,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: CheckoutForm) => {
      if (!actor) throw new Error("Not ready");
      const shoppingItems: ShoppingItem[] = items.map((item) => ({
        productName: item.product.name,
        currency: "usd",
        quantity: BigInt(item.quantity),
        priceInCents: item.product.price,
        productDescription: item.product.description,
      }));
      const successUrl = `${window.location.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/checkout`;
      const url = await actor.createCheckoutSession(
        shoppingItems,
        successUrl,
        cancelUrl,
      );
      sessionStorage.setItem("pendingOrder", JSON.stringify(data));
      window.location.href = url;
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    checkoutMutation.mutate(data);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="font-display text-2xl">Your cart is empty</h2>
            <p className="font-body text-muted-foreground mt-2 mb-6">
              Add some items before checking out.
            </p>
            <Button asChild data-ocid="checkout.shop.button">
              <Link to="/shop">Browse Shop</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-display text-4xl font-semibold mb-10">
            Checkout
          </h1>
          <div className="grid lg:grid-cols-5 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h2 className="font-display text-xl font-medium mb-4">
                    Contact Information
                  </h2>
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="customerName">Full Name</Label>
                      <Input
                        id="customerName"
                        data-ocid="checkout.name.input"
                        placeholder="Jane Smith"
                        autoComplete="name"
                        {...register("customerName", {
                          required: "Name is required",
                        })}
                      />
                      {errors.customerName && (
                        <p
                          data-ocid="checkout.name.error_state"
                          className="text-sm text-destructive"
                        >
                          {errors.customerName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="customerEmail">Email Address</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        data-ocid="checkout.email.input"
                        placeholder="jane@example.com"
                        autoComplete="email"
                        {...register("customerEmail", {
                          required: "Email is required",
                        })}
                      />
                      {errors.customerEmail && (
                        <p
                          data-ocid="checkout.email.error_state"
                          className="text-sm text-destructive"
                        >
                          {errors.customerEmail.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-xl font-medium mb-4">
                    Shipping Address
                  </h2>
                  <div className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        data-ocid="checkout.street.input"
                        placeholder="123 Main Street"
                        autoComplete="street-address"
                        {...register("street", {
                          required: "Street is required",
                        })}
                      />
                      {errors.street && (
                        <p
                          data-ocid="checkout.street.error_state"
                          className="text-sm text-destructive"
                        >
                          {errors.street.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          data-ocid="checkout.city.input"
                          placeholder="New York"
                          autoComplete="address-level2"
                          {...register("city", {
                            required: "City is required",
                          })}
                        />
                        {errors.city && (
                          <p
                            data-ocid="checkout.city.error_state"
                            className="text-sm text-destructive"
                          >
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          data-ocid="checkout.state.input"
                          placeholder="NY"
                          autoComplete="address-level1"
                          {...register("state", {
                            required: "State is required",
                          })}
                        />
                        {errors.state && (
                          <p
                            data-ocid="checkout.state.error_state"
                            className="text-sm text-destructive"
                          >
                            {errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          data-ocid="checkout.zip.input"
                          placeholder="10001"
                          autoComplete="postal-code"
                          {...register("zip", { required: "ZIP is required" })}
                        />
                        {errors.zip && (
                          <p
                            data-ocid="checkout.zip.error_state"
                            className="text-sm text-destructive"
                          >
                            {errors.zip.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          data-ocid="checkout.country.input"
                          placeholder="US"
                          autoComplete="country"
                          {...register("country", {
                            required: "Country is required",
                          })}
                        />
                        {errors.country && (
                          <p
                            data-ocid="checkout.country.error_state"
                            className="text-sm text-destructive"
                          >
                            {errors.country.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {checkingStripe ? (
                  <div
                    data-ocid="checkout.stripe.loading_state"
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="font-body text-sm">
                      Checking payment configuration...
                    </span>
                  </div>
                ) : !stripeConfigured ? (
                  <Alert data-ocid="checkout.stripe.error_state">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Payment is not yet configured for this store. Please
                      contact the administrator.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {checkoutMutation.isError && (
                  <Alert variant="destructive" data-ocid="checkout.error_state">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to initialize checkout. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  size="lg"
                  data-ocid="checkout.submit.button"
                  className="w-full font-body"
                  disabled={
                    checkoutMutation.isPending ||
                    !stripeConfigured ||
                    checkingStripe
                  }
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    "Pay with Card"
                  )}
                </Button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-secondary/30 rounded-xl p-6 sticky top-24">
                <h2 className="font-display text-xl font-medium mb-4">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img
                          src={
                            item.product.imageUrl ||
                            "/assets/generated/category-living-room.dim_600x600.jpg"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-body mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-body font-medium text-sm">
                        {formatPrice(
                          item.product.price * BigInt(item.quantity),
                        )}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between items-center mt-4">
                  <span className="font-body text-muted-foreground">Total</span>
                  <span className="font-display font-bold text-xl text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
