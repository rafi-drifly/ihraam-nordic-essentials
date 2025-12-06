import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  const isSwedish = i18n.language === 'sv';

  const handleCheckout = async () => {
    const cartItems = JSON.parse(localStorage.getItem('ihram-cart') || '[]');
    
    if (cartItems.length === 0) {
      toast({ title: "Cart is empty", description: "Add items to cart before checkout.", variant: "destructive" });
      return;
    }

    setCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: cartItems.map((item: any) => ({ id: item.id, quantity: item.quantity }))
        }
      });

      if (error) {
        toast({ title: "Checkout failed", description: error.message || "Unable to create checkout session.", variant: "destructive" });
        return;
      }

      if (data?.url) {
        localStorage.removeItem('ihram-cart');
        window.location.href = data.url;
      } else {
        toast({ title: "Checkout error", description: "No checkout URL received.", variant: "destructive" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Checkout failed", description: message, variant: "destructive" });
    } finally {
      setCheckingOut(false);
    }
  }

  const isActive = (paths: string[]) => paths.some(path => location.pathname === path);

  const navigation = [
    { name: t('nav.home'), href: isSwedish ? '/sv' : '/', paths: ['/', '/sv'] },
    { name: t('nav.shop'), href: isSwedish ? '/sv/butik' : '/shop', paths: ['/shop', '/sv/butik'] },
    { name: t('nav.blog'), href: isSwedish ? '/sv/blogg' : '/blog', paths: ['/blog', '/sv/blogg'] },
    { name: t('nav.shipping'), href: isSwedish ? '/sv/frakt' : '/shipping', paths: ['/shipping', '/sv/frakt'] },
    { name: t('nav.trackOrder'), href: isSwedish ? '/sv/spara-order' : '/guest-order-lookup', paths: ['/guest-order-lookup', '/sv/spara-order'] },
    { name: t('nav.about'), href: isSwedish ? '/sv/om-oss' : '/about', paths: ['/about', '/sv/om-oss'] },
    { name: t('nav.contact'), href: isSwedish ? '/sv/kontakt' : '/contact', paths: ['/contact', '/sv/kontakt'] },
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isSwedish ? '/sv' : '/'} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="text-xl font-bold text-foreground">Pure Ihram</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.paths)
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Language Switcher, Cart and Mobile menu button */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <CartDrawer onCheckout={handleCheckout} checkingOut={checkingOut} />

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-muted rounded-lg mt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.paths)
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <LanguageSwitcher variant="mobile" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
