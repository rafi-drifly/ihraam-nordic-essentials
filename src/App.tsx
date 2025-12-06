import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import ScrollToTop from "@/components/ScrollToTop";
import LocaleHandler from "@/components/LocaleHandler";
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
import OrderSuccess from "./pages/OrderSuccess";
import GuestOrderLookup from "./pages/GuestOrderLookup";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <LocaleHandler />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
            <Routes>
              {/* English Routes */}
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
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/guest-order-lookup" element={<GuestOrderLookup />} />
              <Route path="/cart" element={<Cart />} />
              
              {/* Swedish Routes */}
              <Route path="/sv" element={<Home />} />
              <Route path="/sv/butik" element={<Shop />} />
              <Route path="/sv/blogg" element={<Blog />} />
              <Route path="/sv/blogg/hur-man-bar-ihram" element={<BlogPost />} />
              <Route path="/sv/blogg/sunnah-handlingar-innan-ihram" element={<SunnahActsBlog />} />
              <Route path="/sv/blogg/checklista-umrah-forberedelse" element={<UmrahChecklistBlog />} />
              <Route path="/sv/blogg/vanliga-misstag-ihram" element={<IhramMistakesBlog />} />
              <Route path="/sv/blogg/viktiga-duas-umrah" element={<UmrahDuasBlog />} />
              <Route path="/sv/blogg/andlig-betydelse-ihram" element={<IhramSpiritualMeaningBlog />} />
              <Route path="/sv/blogg/:slug" element={<BlogPost />} />
              <Route path="/sv/om-oss" element={<About />} />
              <Route path="/sv/kontakt" element={<Contact />} />
              <Route path="/sv/frakt" element={<Shipping />} />
              <Route path="/sv/order-bekraftelse" element={<OrderSuccess />} />
              <Route path="/sv/spara-order" element={<GuestOrderLookup />} />
              <Route path="/sv/varukorg" element={<Cart />} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
