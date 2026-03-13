import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

function formatPrice(cents: bigint): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents) / 100);
}

export default function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        data-ocid="cart.sheet"
        className="w-full sm:max-w-md flex flex-col p-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-border">
          <SheetTitle className="font-display text-xl flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Your Cart
            {totalItems > 0 && (
              <span className="text-sm font-body font-normal text-muted-foreground">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div
            data-ocid="cart.empty_state"
            className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center"
          >
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <div>
              <p className="font-display text-lg text-foreground">
                Your cart is empty
              </p>
              <p className="text-sm text-muted-foreground font-body mt-1">
                Add some beautiful pieces to get started
              </p>
            </div>
            <Button
              variant="outline"
              data-ocid="cart.shop.button"
              onClick={() => setIsOpen(false)}
              asChild
            >
              <Link to="/shop">Browse Shop</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={item.product.id}
                    data-ocid={`cart.item.${idx + 1}`}
                    className="flex gap-4"
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
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
                      <p className="font-display font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-primary font-semibold mt-1">
                        {formatPrice(item.product.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          data-ocid={`cart.qty_decrease.button.${idx + 1}`}
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          data-ocid={`cart.qty_increase.button.${idx + 1}`}
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          data-ocid={`cart.remove.button.${idx + 1}`}
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="px-6 py-5 border-t border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-body text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-display font-semibold text-lg">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                data-ocid="cart.checkout.button"
                asChild
                onClick={() => setIsOpen(false)}
              >
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
