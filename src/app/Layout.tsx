import { Outlet } from "react-router";
import { Hero } from "./components/Hero";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />
      <Outlet />
    </div>
  );
}
