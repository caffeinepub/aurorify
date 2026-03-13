import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";

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

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 1 }: Props) {
  const { addToCart } = useCart();

  return (
    <div
      data-ocid={`product.item.${index}`}
      className="group bg-card rounded-lg overflow-hidden shadow-card hover:shadow-warm transition-shadow duration-300"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="aspect-square overflow-hidden bg-secondary">
          <img
            src={
              product.imageUrl ||
              "/assets/generated/category-living-room.dim_600x600.jpg"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="text-xs font-body">
            {categoryLabel[product.category] ?? product.category}
          </Badge>
        </div>
        <Link to="/product/$id" params={{ id: product.id }}>
          <h3 className="font-display font-medium text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 font-body">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <span className="font-display font-semibold text-lg text-primary">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            data-ocid={`product.add_to_cart.button.${index}`}
            onClick={() => addToCart(product)}
            className="flex items-center gap-1"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
