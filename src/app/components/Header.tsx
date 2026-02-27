import { useState } from "react";
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const totalItems = getTotalItems();
  const isCartPage = location.pathname === "/cart";
  const isContactPage = location.pathname === "/contact";

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="relative">
        <Link to="/" className="block hover:opacity-95 transition-opacity">
          <img src="https://i.postimg.cc/yYhhHY6X/banner-simple.jpg" alt="TheEkt" className="w-full h-auto object-contain" style={{ maxHeight: '120px' }} />
        </Link>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
          {!isContactPage && (
            <Link to="/contact">
              <Button variant="outline">
                <MessageCircle className="w-5 h-5 mr-2" />
                Contáctanos
              </Button>
            </Link>
          )}
          
          {!isCartPage && (
            <Link to="/cart">
              <Button variant="outline" className="relative">
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
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <UserMenu />
          ) : (
            <AuthModal 
              open={authModalOpen} 
              onOpenChange={setAuthModalOpen}
              trigger={
                <Button variant="outline">
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar sesión
                </Button>
              }
            />
          )}
        </div>
      </div>
    </header>
  );
}
