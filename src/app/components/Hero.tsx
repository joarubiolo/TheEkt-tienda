import { useState } from "react";
import { Link, useLocation } from "react-router";
import { ShoppingCart, MessageCircle, LogIn } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { AuthModal } from "./AuthModal";
import { UserMenu } from "./UserMenu";

export function Hero() {
  const { getTotalItems } = useCart();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const totalItems = getTotalItems();
  const isCartPage = location.pathname === "/cart";
  const isContactPage = location.pathname === "/contact";

  return (
    <section 
      className="hero image-as-background relative h-[700px] flex items-center"
      style={{
        backgroundImage: `url('https://i.postimg.cc/yNRs9Jpn/tienda-portada.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="hero-container absolute inset-0 flex flex-col items-center justify-center">
        <img 
          src="https://i.postimg.cc/7Yn9tWrD/Icon_transp.png" 
          alt="TheEkt" 
          className="h-32 md:h-48 w-auto object-contain mb-4 animate-fadeInLeft"
        />
        <img 
          src="https://i.postimg.cc/GhxKg5nw/title_transp.png" 
          alt="TheEkt" 
          className="h-16 md:h-24 w-auto object-contain mb-8 animate-fadeInLeft delay-400"
        />
      </div>
      
      <div className="absolute top-8 right-8 flex flex-row gap-3">
        {!isContactPage && (
          <Link to="/contact">
            <Button variant="outline" className="bg-white/90 hover:bg-white animate-fadeInLeft delay-600">
              <MessageCircle className="w-5 h-5 mr-2" />
              Contáctanos
            </Button>
          </Link>
        )}
        
        {!isCartPage && (
          <Link to="/cart">
            <Button variant="outline" className="bg-white/90 hover:bg-white relative animate-fadeInLeft delay-700">
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
              <Button variant="outline" className="bg-white/90 hover:bg-white animate-fadeInLeft delay-800">
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar sesión
              </Button>
            }
          />
        )}
      </div>
    </section>
  );
}
          />
        )}
      </div>
    </section>
  );
}
