import { Outlet } from "react-router";
import { Hero } from "./components/Hero";
import { Toaster } from "./components/ui/sonner";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <Outlet />
      <footer className="bg-gray-900 text-gray-400 py-4 px-6 text-center text-sm">
        *El precio indicado es el descuento que se hace al realizar la compra por transferencia, para más detalles póngase en contacto con nosotros
      </footer>
      <Toaster position="bottom-right" />
    </div>
  );
}
