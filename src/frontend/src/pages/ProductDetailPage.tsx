import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";

const categoryLabel: Record<string, string> = {
  livingRoom: "Living Room",
  bedroom: "Bedroom",
  kitchen: "Kitchen",
  bathroom: "Bathroom",
  outdoor: "Outdoor",
};

function formatPrice(cents: bigint): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents) / 100);
}

export default function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const { addToCart } = useCart();
  const { actor, isFetching } = useActor();
  const [qty, setQty] = useState(1);

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => actor!.getProduct(id),
    enabled: !!actor && !isFetching && !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CartDrawer />
        <main className="flex-1 container mx-auto px-4 py-16">
          <div
            data-ocid="product.loading_state"
            className="grid md:grid-cols-2 gap-12"
          >
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CartDrawer />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div data-ocid="product.error_state">
            <p className="font-display text-2xl">Product not found</p>
            <Button asChild className="mt-6">
              <Link to="/shop">Back to Shop</Link>
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
      <CartDrawer />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 font-body">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to="/shop"
              className="hover:text-foreground transition-colors"
            >
              Shop
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="aspect-square rounded-xl overflow-hidden bg-secondary"
            >
              <img
                src={
                  product.imageUrl ||
                  "/assets/generated/category-living-room.dim_600x600.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col gap-4"
            >
              <Badge variant="secondary" className="w-fit font-body">
                {categoryLabel[product.category] ?? product.category}
              </Badge>
              <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">
                {product.name}
              </h1>
              <p className="font-display text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    data-ocid="product.qty_decrease.button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-secondary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-5 py-2 font-body font-medium text-center w-14">
                    {qty}
                  </span>
                  <button
                    type="button"
                    data-ocid="product.qty_increase.button"
                    onClick={() => setQty((q) => q + 1)}
                    className="px-3 py-2 hover:bg-secondary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  size="lg"
                  data-ocid="product.add_to_cart.button"
                  onClick={() => addToCart(product, qty)}
                  className="flex-1 flex items-center gap-2 font-body"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </Button>
              </div>

              <div className="mt-4 p-4 bg-secondary/40 rounded-lg">
                <p className="text-sm font-body text-muted-foreground">
                  ✦ Free shipping on orders over $75
                  <br />✦ 30-day hassle-free returns
                  <br />✦ Carefully curated and quality-checked
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
