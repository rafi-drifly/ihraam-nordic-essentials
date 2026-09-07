import { Suspense, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import ScrollToTop from "@/components/ScrollToTop";
import PageViewTracker from "@/components/PageViewTracker";
import LocaleHandler from "@/components/LocaleHandler";
import SEOHead from "@/components/SEOHead";
import PromoBanner from "@/components/PromoBanner";
import WhatsAppButton from "@/components/WhatsAppButton";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ArticlePage from "./pages/ArticlePage";
import SunnahActsBlog from "./pages/SunnahActsBlog";
import UmrahChecklistBlog from "./pages/UmrahChecklistBlog";
import IhramMistakesBlog from "./pages/IhramMistakesBlog";
import UmrahDuasBlog from "./pages/UmrahDuasBlog";
import IhramSpiritualMeaningBlog from "./pages/IhramSpiritualMeaningBlog";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Shipping from "./pages/Shipping";
import Partners from "./pages/Partners";
import OrderSuccess from "./pages/OrderSuccess";
import GuestOrderLookup from "./pages/GuestOrderLookup";
import Cart from "./pages/Cart";
import SupportOurMission from "./pages/SupportOurMission";
import DonationSuccess from "./pages/DonationSuccess";
import DonationCancel from "./pages/DonationCancel";
import Transparency from "./pages/Transparency";
import MosqueSupport from "./pages/MosqueSupport";
import Returns from "./pages/Returns";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminOrders from "./pages/admin/Orders";
import AdminInventory from "./pages/admin/Inventory";
import { RequireAdmin } from "@/components/admin/RequireAdmin";
import { applyPwaIdentity, isAdminPath } from "@/lib/adminPwa";
import { LOCALE_CODES, routePath } from "@/i18n/locales";
import AdminImages from "./pages/admin/Images";

const queryClient = new QueryClient();

// Shared routes configuration
/**
 * Every public page, once. These are rendered for each language in the locale
 * manifest, so adding a language is one entry there plus a translation file,
 * not another twenty-five Route lines copied by hand.
 */
const PUBLIC_ROUTES: Array<{ path: string; element: JSX.Element }> = [
  { path: "", element: <Home /> },
  { path: "shop", element: <Shop /> },
  { path: "blog", element: <Blog /> },
  { path: "blog/how-to-wear-ihram", element: <BlogPost /> },
  { path: "blog/sunnah-acts-before-ihram", element: <SunnahActsBlog /> },
  { path: "blog/umrah-preparation-checklist", element: <UmrahChecklistBlog /> },
  { path: "blog/common-mistakes-ihram", element: <IhramMistakesBlog /> },
  { path: "blog/essential-duas-umrah", element: <UmrahDuasBlog /> },
  { path: "blog/spiritual-meaning-ihram", element: <IhramSpiritualMeaningBlog /> },
  { path: "blog/:slug", element: <ArticlePage /> },
  { path: "about", element: <About /> },
  { path: "contact", element: <Contact /> },
  { path: "shipping", element: <Shipping /> },
  { path: "partners", element: <Partners /> },
  { path: "order-success", element: <OrderSuccess /> },
  { path: "guest-order-lookup", element: <GuestOrderLookup /> },
  { path: "cart", element: <Cart /> },
  { path: "support-our-mission", element: <SupportOurMission /> },
  { path: "donation-success", element: <DonationSuccess /> },
  { path: "donation-cancel", element: <DonationCancel /> },
  { path: "transparency", element: <Transparency /> },
  { path: "mosque-support", element: <MosqueSupport /> },
  { path: "returns", element: <Returns /> },
];

/** Retired URLs, redirected within whatever language the visitor is in. */
const LEGACY_REDIRECTS = [
  { from: "guides", to: "blog" },
  { from: "support", to: "contact" },
];

const AppRoutes = () => (
  <Routes>
    {LOCALE_CODES.flatMap((code) =>
      PUBLIC_ROUTES.map((route) => (
        <Route
          key={`${code}:${route.path}`}
          path={routePath(code, route.path)}
          element={route.element}
        />
      ))
    )}

    {/* Old paths people may still have bookmarked, kept in every language so
        a Swedish visitor on /sv/guides lands on /sv/blog rather than English. */}
    {LOCALE_CODES.flatMap((code) =>
      LEGACY_REDIRECTS.map(({ from, to }) => (
        <Route
          key={`${code}:${from}`}
          path={routePath(code, from)}
          element={<Navigate to={routePath(code, to)} replace />}
        />
      ))
    )}

    {/* Back office. Not localised, and gated by RequireAdmin and RLS. */}
    <Route path="/admin" element={<AdminLogin />} />
    <Route path="/admin/orders" element={<RequireAdmin><AdminOrders /></RequireAdmin>} />
    <Route path="/admin/inventory" element={<RequireAdmin><AdminInventory /></RequireAdmin>} />
    <Route path="/admin/images" element={<RequireAdmin><AdminImages /></RequireAdmin>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const Shell = () => {
  const { pathname } = useLocation();
  const admin = isAdminPath(pathname);

  useEffect(() => {
    applyPwaIdentity(pathname);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {!admin && <PromoBanner />}
      {!admin && <Navbar />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!admin && <Footer />}
      {!admin && <WhatsAppButton />}
    </div>
  );
};

const App = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <PageViewTracker />
              <LocaleHandler />
              <SEOHead />
              <Shell />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </QueryClientProvider>
  </Suspense>
);

export default App;
