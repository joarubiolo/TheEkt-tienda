import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, ShoppingBag, Heart, LogOut, Settings, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        className="relative h-10 px-2 flex items-center gap-2 rounded-full hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8 border-2 border-gray-200">
          <AvatarImage src={profile?.avatar_url || user.photoURL || ""} />
          <AvatarFallback className="bg-gray-900 text-white text-sm">
            {getInitials(profile?.full_name || user.displayName || "U")}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md border border-gray-200 shadow-lg z-[9999]">
          {/* Header del menú */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {profile?.full_name || user.displayName || "Usuario"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {profile?.email || user.email}
            </p>
          </div>

          {/* Opciones del menú */}
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>Mi Perfil</span>
            </Link>

            <Link
              to="/orders"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Mis Pedidos</span>
            </Link>

            <Link
              to="/wishlist"
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="h-4 w-4" />
              <span>Mis Favoritos</span>
            </Link>

            <div className="border-t border-gray-100 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
