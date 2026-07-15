import { Outlet, useLocation } from "react-router";
import { Hero } from "./components/Hero";
import { Toaster } from "./components/ui/sonner";

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <Outlet key={location.pathname} />
      <Toaster position="bottom-right" />
    </div>
  );
}
