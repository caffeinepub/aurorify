import { Link } from "@tanstack/react-router";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="bg-foreground text-background" id="contact">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <img
              src="/assets/generated/aurorify-logo-transparent.dim_400x100.png"
              alt="Aurorify"
              className="h-8 w-auto object-contain mb-4 brightness-200 invert"
            />
            <p className="text-background/70 text-sm leading-relaxed max-w-xs">
              Curated home decor for the modern living space. Discover pieces
              that transform your house into a home.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/60 hover:text-background transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/60 hover:text-background transition-colors"
                aria-label="Facebook"
              >
                <SiFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-background/60 hover:text-background transition-colors"
                aria-label="X"
              >
                <SiX className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-medium text-background mb-4">
              Shop
            </h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link
                  to="/shop"
                  className="hover:text-background transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  search={{ category: "livingRoom" }}
                  className="hover:text-background transition-colors"
                >
                  Living Room
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  search={{ category: "bedroom" }}
                  className="hover:text-background transition-colors"
                >
                  Bedroom
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  search={{ category: "kitchen" }}
                  className="hover:text-background transition-colors"
                >
                  Kitchen
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  search={{ category: "outdoor" }}
                  className="hover:text-background transition-colors"
                >
                  Outdoor
                </Link>
              </li>
            </ul>
          </div>

          <div id="about">
            <h4 className="font-display font-medium text-background mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li>
                <Link
                  to="/"
                  className="hover:text-background transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="hover:text-background transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-background transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-background transition-colors"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-background transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-6 text-center text-sm text-background/50">
          © {year}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-background/80 transition-colors"
          >
            Built with ♥ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
