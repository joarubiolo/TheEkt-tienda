import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ShoppingCart, MessageCircle, LogIn, Menu, User, Package, Phone } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { UserMenu } from "./UserMenu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "./ui/sheet";

export function Header() {
  const { getTotalItems } = useCart();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const totalItems = getTotalItems();
  const isCartPage = location.pathname === "/cart";
  const isContactPage = location.pathname === "/contact";

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 150) {
        setScrollProgress(0);
      } else if (scrollY > 50) {
        setScrollProgress(1 - (scrollY - 50) / 100);
      } else {
        setScrollProgress(1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/ninos", label: "Niños" },
    { to: "/adultos", label: "Adultos" },
    { to: "/wishlist", label: "Favoritos" },
  ];

  return (
    <>
      <div
        className="relative sticky top-0 z-40 transition-all duration-300"
        style={{
          height: scrollProgress > 0 ? `${120 + scrollProgress * 180}px` : '0px',
          opacity: scrollProgress,
          overflow: 'hidden'
        }}
      >
        <img
          src="https://i.postimg.cc/rmyGrMZW/stone_local.jpg"
          alt="Stone Store"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30" />

        {/* Desktop Navigation */}
        <div className="hidden md:flex relative h-full items-center justify-end px-8">
          <div className="flex items-center gap-3">
            {!isContactPage && (
              <Link to="/contact">
                <Button variant="outline" className="bg-white/90 hover:bg-white">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contáctanos
                </Button>
              </Link>
            )}

            {!isCartPage && (
              <Link to="/cart">
                <Button variant="outline" className="bg-white/90 hover:bg-white relative">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrito
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/90 animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <AuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                trigger={
                  <Button variant="outline" className="bg-white/90 hover:bg-white">
                    <LogIn className="w-5 h-5 mr-2" />
                    Iniciar sesión
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Mobile Header Content - Always visible */}
        <div className="md:hidden absolute inset-0 flex items-center justify-between px-3 py-2">
          {/* Hamburguesa */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center justify-center flex-1">
            <img
              src="https://i.postimg.cc/7Yn9tWrD/Icon_transp.png"
              alt="TheEkt"
              className="h-10 w-auto"
            />
          </Link>

          {/* Right side buttons */}
          <div className="flex items-center gap-1">
            {/* Contact button */}
            {!isContactPage && (
              <Link to="/contact" className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                <MessageCircle className="w-4 h-4" />
              </Link>
            )}

            {/* Cart button */}
            {!isCartPage && (
              <Link to="/cart" className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors relative">
                <ShoppingCart className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* User/Login button */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-white/90 animate-pulse" />
            ) : user ? (
              <Link to="/profile" className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <AuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                trigger={
                  <button className="p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                    <LogIn className="w-4 h-4" />
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-80">
          <SheetTitle className="text-left mb-6">
            <img
              src="https://i.postimg.cc/7Yn9tWrD/Icon_transp.png"
              alt="TheEkt"
              className="h-12 w-auto"
            />
          </SheetTitle>

          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileNavOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === link.to
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                >
                  <User className="w-5 h-5" />
                  Mi Cuenta
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
                >
                  <Package className="w-5 h-5" />
                  Mis Pedidos
                </Link>
              </>
            ) : (
              <AuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                trigger={
                  <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 w-full">
                    <LogIn className="w-5 h-5" />
                    Iniciar sesión
                  </button>
                }
              />
            )}

            <Link
              to="/contact"
              onClick={() => setMobileNavOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100"
            >
              <Phone className="w-5 h-5" />
              Contacto
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}