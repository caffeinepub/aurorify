import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useMemo } from "react";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useActor } from "../hooks/useActor";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "livingRoom", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "outdoor", label: "Outdoor" },
];

export default function ShopPage() {
  const search = useSearch({ from: "/shop" }) as { category?: string };
  const navigate = useNavigate();
  const activeCategory = search.category ?? "all";
  const { actor, isFetching } = useActor();

  const { data: products, isLoading } = useQuery({
    queryKey: ["availableProducts"],
    queryFn: () => actor!.listAvailableProducts(),
    enabled: !!actor && !isFetching,
  });

  const filtered = useMemo(() => {
    if (!products) return [];
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const handleCategoryChange = (val: string) => {
    navigate({
      to: "/shop",
      search: val === "all" ? {} : { category: val },
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <div className="bg-secondary/30 py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-primary font-body text-sm uppercase tracking-widest mb-2">
                Our Collection
              </p>
              <h1 className="font-display text-4xl font-semibold">
                Shop All Products
              </h1>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-8">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  data-ocid="shop.category.tab"
                  className="font-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div
              data-ocid="shop.loading_state"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[...Array(6)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div data-ocid="shop.empty_state" className="text-center py-20">
              <p className="font-display text-2xl text-muted-foreground">
                No products found
              </p>
              <p className="font-body text-sm text-muted-foreground mt-2">
                Try a different category or check back soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4) }}
                >
                  <ProductCard product={product} index={i + 1} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
