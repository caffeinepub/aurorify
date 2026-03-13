import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useActor } from "../hooks/useActor";

const categories = [
  {
    key: "livingRoom",
    label: "Living Room",
    image: "/assets/generated/category-living-room.dim_600x600.jpg",
  },
  {
    key: "bedroom",
    label: "Bedroom",
    image: "/assets/generated/category-bedroom.dim_600x600.jpg",
  },
  {
    key: "kitchen",
    label: "Kitchen",
    image: "/assets/generated/category-kitchen.dim_600x600.jpg",
  },
  {
    key: "bathroom",
    label: "Bathroom",
    image: "/assets/generated/category-bathroom.dim_600x600.jpg",
  },
  {
    key: "outdoor",
    label: "Outdoor",
    image: "/assets/generated/category-outdoor.dim_600x600.jpg",
  },
];

export default function HomePage() {
  const { actor, isFetching } = useActor();

  const { data: products, isLoading } = useQuery({
    queryKey: ["availableProducts"],
    queryFn: () => actor!.listAvailableProducts(),
    enabled: !!actor && !isFetching,
  });

  const featured = products?.slice(0, 4) ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[85vh] min-h-[560px] overflow-hidden">
          <img
            src="/assets/generated/hero-living-room.dim_1600x900.jpg"
            alt="Beautiful home interior"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-xl"
              >
                <p className="text-accent font-body text-sm uppercase tracking-widest mb-4">
                  Curated Home Decor
                </p>
                <h1 className="font-display text-5xl md:text-7xl text-background font-bold leading-tight">
                  Live in
                  <br />
                  <span className="italic font-light">Beautiful</span>
                  <br />
                  Spaces
                </h1>
                <p className="text-background/80 font-body mt-6 text-lg leading-relaxed">
                  Discover handpicked pieces that transform your home into a
                  sanctuary of style and comfort.
                </p>
                <div className="flex gap-4 mt-8">
                  <Button
                    size="lg"
                    data-ocid="hero.shop_now.button"
                    asChild
                    className="font-body"
                  >
                    <Link to="/shop">
                      Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    data-ocid="hero.explore.button"
                    asChild
                    className="border-background/40 text-background bg-transparent hover:bg-background/10 font-body"
                  >
                    <a href="#categories">Explore Collections</a>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <p className="text-primary font-body text-sm uppercase tracking-widest mb-2">
                Collections
              </p>
              <h2 className="font-display text-4xl font-semibold">
                Shop by Room
              </h2>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat, i) => (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    to="/shop"
                    search={{ category: cat.key }}
                    data-ocid={`category.item.${i + 1}`}
                    className="group block"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3">
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <p className="font-body font-medium text-center text-sm group-hover:text-primary transition-colors">
                      {cat.label}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-primary font-body text-sm uppercase tracking-widest mb-2">
                  Handpicked
                </p>
                <h2 className="font-display text-4xl font-semibold">
                  Featured Pieces
                </h2>
              </div>
              <Link
                to="/shop"
                data-ocid="featured.view_all.link"
                className="flex items-center gap-1 text-sm font-body font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {isLoading ? (
              <div
                data-ocid="featured.loading_state"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {[...Array(4)].map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : featured.length === 0 ? (
              <div
                data-ocid="featured.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <p className="font-display text-xl">No products yet</p>
                <p className="font-body text-sm mt-2">
                  Check back soon for our curated collection.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featured.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <ProductCard product={product} index={i + 1} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Brand banner */}
        <section className="py-24 bg-primary text-primary-foreground text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="container mx-auto px-4"
          >
            <h2 className="font-display text-4xl md:text-5xl font-light italic mb-4">
              Your home, your story.
            </h2>
            <p className="font-body text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Every piece in our collection is chosen to bring warmth, elegance,
              and intention to your space.
            </p>
            <Button
              size="lg"
              variant="secondary"
              data-ocid="banner.shop.button"
              asChild
              className="font-body"
            >
              <Link to="/shop">Discover the Collection</Link>
            </Button>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
