import { Outlet } from "react-router";
import { Hero } from "./components/Hero";
import { Toaster } from "./components/ui/sonner";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <Outlet />
      <Toaster position="bottom-right" />
    </div>
  );
}
