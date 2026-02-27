import { Outlet } from "react-router";
import { Header } from "./components/Header";
import { StoreHeader } from "./components/StoreHeader";
import { Toaster } from "./components/ui/sonner";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <StoreHeader />
      <Outlet />
      <Toaster position="bottom-right" />
    </div>
  );
}
