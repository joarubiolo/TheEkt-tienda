import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { HomePage } from "./pages/HomePage";
import { CartPage } from "./pages/CartPage";
import { ContactPage } from "./pages/ContactPage";
import { SuccessPage } from "./pages/SuccessPage";
import { CancelPage } from "./pages/CancelPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OrdersPage } from "./pages/OrdersPage";
import { WishlistPage } from "./pages/WishlistPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "ninos", Component: HomePage },
      { path: "adultos", Component: HomePage },
      { path: "cart", Component: CartPage },
      { path: "contact", Component: ContactPage },
      { path: "success", Component: SuccessPage },
      { path: "cancel", Component: CancelPage },
      { path: "profile", Component: ProfilePage },
      { path: "orders", Component: OrdersPage },
      { path: "wishlist", Component: WishlistPage },
    ],
  },
]);