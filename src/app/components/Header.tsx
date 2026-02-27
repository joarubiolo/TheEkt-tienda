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
    <header 
      className="bg-white border-b border-gray-200"
      style={{
        backgroundImage: `url('https://i.postimg.cc/yYhhHY6X/banner-simple.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '120px'
      }}
    >
      <div className="px-4 py-4 flex items-center justify-between h-full">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity ml-2">
            <img src="https://i.postimg.cc/7Yn9tWrD/Icon_transp.png" alt="TheEkt" className="h-16 md:h-20 lg:h-24 w-auto object-contain" />
          </Link>
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="https://i.postimg.cc/GhxKg5nw/title_transp.png" alt="TheEkt" className="h-12 md:h-16 lg:h-20 w-auto object-contain" />
          </Link>
          <img src="https://i.postimg.cc/BZBWdJ06/Sin-titulo-(1).png" alt="" className="h-16 md:h-20 lg:h-24 w-auto object-contain ml-[10px]" />
        </div>

        <div className="flex items-center gap-3">
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
