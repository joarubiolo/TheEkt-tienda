import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { ShoppingCart, MessageCircle, LogIn } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { UserMenu } from "./UserMenu";

export function Header() {
  const { getTotalItems } = useCart();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
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

  return (
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
      
      <div className="relative h-full flex items-center justify-end px-8">
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
    </div>
  );
}
