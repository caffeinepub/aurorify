import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
  else window.location.href = `/#${id}`;
};

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const { identity, login, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !isFetching && !!identity,
  });

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" data-ocid="nav.link" className="flex items-center gap-2">
          <img
            src="/assets/generated/aurorify-logo-transparent.dim_400x100.png"
            alt="Aurorify"
            className="h-8 w-auto object-contain"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/shop"
            data-ocid="nav.shop.link"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Shop
          </Link>
          <button
            type="button"
            data-ocid="nav.about.link"
            onClick={() => scrollToSection("about")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </button>
          <button
            type="button"
            data-ocid="nav.contact.link"
            onClick={() => scrollToSection("contact")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Contact
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              data-ocid="nav.admin.link"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-ocid="nav.cart.button"
            onClick={() => setIsOpen(true)}
            className="relative p-2 hover:bg-secondary rounded-full transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                {totalItems}
              </Badge>
            )}
          </button>

          {identity ? (
            <Button
              variant="ghost"
              size="sm"
              data-ocid="nav.logout.button"
              onClick={() => clear()}
              className="hidden md:flex items-center gap-1 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          ) : (
            <Button
              size="sm"
              data-ocid="nav.login.button"
              onClick={() => login()}
              className="hidden md:flex items-center gap-1"
            >
              <User className="h-4 w-4" /> Login
            </Button>
          )}

          <button
            type="button"
            className="md:hidden p-2 hover:bg-secondary rounded-full transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-4">
          <Link
            to="/shop"
            data-ocid="nav.mobile.shop.link"
            className="text-sm font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Shop
          </Link>
          <button
            type="button"
            className="text-sm font-medium text-left"
            onClick={() => {
              scrollToSection("about");
              setMobileOpen(false);
            }}
          >
            About
          </button>
          <button
            type="button"
            className="text-sm font-medium text-left"
            onClick={() => {
              scrollToSection("contact");
              setMobileOpen(false);
            }}
          >
            Contact
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm font-medium text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}
          {identity ? (
            <button
              type="button"
              data-ocid="nav.mobile.logout.button"
              onClick={() => {
                clear();
                setMobileOpen(false);
              }}
              className="text-sm font-medium text-left text-muted-foreground"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              data-ocid="nav.mobile.login.button"
              onClick={() => {
                login();
                setMobileOpen(false);
              }}
              className="text-sm font-medium text-left text-primary"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
}
