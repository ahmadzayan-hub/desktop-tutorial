import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { I18nProvider } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { useAbandonedCart } from "@/hooks/useAbandonedCart";

// Route-level code splitting → keeps the initial bundle tiny (<1s loads).
const Home = lazy(() => import("@/pages/Home"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const ThankYou = lazy(() => import("@/pages/ThankYou"));

function PageFallback() {
  return (
    <div className="grid min-h-[40vh] place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl gold-text">404</h1>
      <Link to="/" className="gold-cta mt-6 inline-block">Home</Link>
    </div>
  );
}

// Lives inside CartProvider so it can watch the cart for the 20-min timer.
function AbandonedCartWatcher() {
  useAbandonedCart();
  return null;
}

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <BrowserRouter>
          <AbandonedCartWatcher />
          <Header />
          <main className="min-h-[60vh]">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <footer className="border-t border-gold/15 py-8 text-center text-xs text-cream/40">
            © {new Date().getFullYear()} Beyond Style UAE · Gold-tone plated fashion jewelry
          </footer>
        </BrowserRouter>
      </CartProvider>
    </I18nProvider>
  );
}
