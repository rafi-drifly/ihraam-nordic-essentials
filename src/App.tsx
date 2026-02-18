import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/hooks/useCart";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import ScrollToTop from "@/components/ScrollToTop";
import LocaleHandler from "@/components/LocaleHandler";
import SEOHead from "@/components/SEOHead";
import PromoBanner from "@/components/PromoBanner";
import WhatsAppButton from "@/components/WhatsAppButton";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Shared routes configuration
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/shop" element={<Shop />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/how-to-wear-ihram" element={<BlogPost />} />
    <Route path="/blog/sunnah-acts-before-ihram" element={<SunnahActsBlog />} />
    <Route path="/blog/umrah-preparation-checklist" element={<UmrahChecklistBlog />} />
    <Route path="/blog/common-mistakes-ihram" element={<IhramMistakesBlog />} />
    <Route path="/blog/essential-duas-umrah" element={<UmrahDuasBlog />} />
    <Route path="/blog/spiritual-meaning-ihram" element={<IhramSpiritualMeaningBlog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/shipping" element={<Shipping />} />
    <Route path="/partners" element={<Partners />} />
    <Route path="/order-success" element={<OrderSuccess />} />
    <Route path="/guest-order-lookup" element={<GuestOrderLookup />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/support-our-mission" element={<SupportOurMission />} />
    <Route path="/donation-success" element={<DonationSuccess />} />
    <Route path="/donation-cancel" element={<DonationCancel />} />
    <Route path="/transparency" element={<Transparency />} />
    <Route path="/mosque-support" element={<MosqueSupport />} />
    {/* Swedish routes */}
    <Route path="/sv" element={<Home />} />
    <Route path="/sv/shop" element={<Shop />} />
    <Route path="/sv/blog" element={<Blog />} />
    <Route path="/sv/blog/how-to-wear-ihram" element={<BlogPost />} />
    <Route path="/sv/blog/sunnah-acts-before-ihram" element={<SunnahActsBlog />} />
    <Route path="/sv/blog/umrah-preparation-checklist" element={<UmrahChecklistBlog />} />
    <Route path="/sv/blog/common-mistakes-ihram" element={<IhramMistakesBlog />} />
    <Route path="/sv/blog/essential-duas-umrah" element={<UmrahDuasBlog />} />
    <Route path="/sv/blog/spiritual-meaning-ihram" element={<IhramSpiritualMeaningBlog />} />
    <Route path="/sv/blog/:slug" element={<BlogPost />} />
    <Route path="/sv/about" element={<About />} />
    <Route path="/sv/contact" element={<Contact />} />
    <Route path="/sv/shipping" element={<Shipping />} />
    <Route path="/sv/partners" element={<Partners />} />
    <Route path="/sv/order-success" element={<OrderSuccess />} />
    <Route path="/sv/guest-order-lookup" element={<GuestOrderLookup />} />
    <Route path="/sv/cart" element={<Cart />} />
    <Route path="/sv/support-our-mission" element={<SupportOurMission />} />
    <Route path="/sv/donation-success" element={<DonationSuccess />} />
    <Route path="/sv/donation-cancel" element={<DonationCancel />} />
    <Route path="/sv/transparency" element={<Transparency />} />
    <Route path="/sv/mosque-support" element={<MosqueSupport />} />
    {/* Norwegian routes */}
    <Route path="/no" element={<Home />} />
    <Route path="/no/shop" element={<Shop />} />
    <Route path="/no/blog" element={<Blog />} />
    <Route path="/no/blog/how-to-wear-ihram" element={<BlogPost />} />
    <Route path="/no/blog/sunnah-acts-before-ihram" element={<SunnahActsBlog />} />
    <Route path="/no/blog/umrah-preparation-checklist" element={<UmrahChecklistBlog />} />
    <Route path="/no/blog/common-mistakes-ihram" element={<IhramMistakesBlog />} />
    <Route path="/no/blog/essential-duas-umrah" element={<UmrahDuasBlog />} />
    <Route path="/no/blog/spiritual-meaning-ihram" element={<IhramSpiritualMeaningBlog />} />
    <Route path="/no/blog/:slug" element={<BlogPost />} />
    <Route path="/no/about" element={<About />} />
    <Route path="/no/contact" element={<Contact />} />
    <Route path="/no/shipping" element={<Shipping />} />
    <Route path="/no/partners" element={<Partners />} />
    <Route path="/no/order-success" element={<OrderSuccess />} />
    <Route path="/no/guest-order-lookup" element={<GuestOrderLookup />} />
    <Route path="/no/cart" element={<Cart />} />
    <Route path="/no/support-our-mission" element={<SupportOurMission />} />
    <Route path="/no/donation-success" element={<DonationSuccess />} />
    <Route path="/no/donation-cancel" element={<DonationCancel />} />
    <Route path="/no/transparency" element={<Transparency />} />
    <Route path="/no/mosque-support" element={<MosqueSupport />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <LocaleHandler />
              <SEOHead />
              <div className="min-h-screen flex flex-col">
                <PromoBanner />
                <Navbar />
                <main className="flex-1">
                  <AppRoutes />
                </main>
                <Footer />
                <WhatsAppButton />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </Suspense>
);

export default App;
