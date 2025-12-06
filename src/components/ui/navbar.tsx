import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const handleCheckout = async () => {
    const cartItems = JSON.parse(localStorage.getItem('ihram-cart') || '[]');
    
    if (cartItems.length === 0) {
      toast({ title: "Cart is empty", description: "Add items to cart before checkout.", variant: "destructive" });
      return;
    }

    setCheckingOut(true);
    try {
      console.log('Starting checkout with items:', cartItems);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: cartItems.map((item: any) => ({ id: item.id, quantity: item.quantity }))
        }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout error:', error);
        toast({ title: "Checkout failed", description: error.message || "Unable to create checkout session.", variant: "destructive" });
        return;
      }

      if (data?.url) {
        // Clear cart after successful checkout
        localStorage.removeItem('ihram-cart');
        window.location.href = data.url;
      } else {
        toast({ title: "Checkout error", description: "No checkout URL received.", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({ title: "Checkout failed", description: message, variant: "destructive" });
    } finally {
      setCheckingOut(false);
    }
  }

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Guides & Knowledge", href: "/blog" },
    { name: "Shipping", href: "/shipping" },  
    { name: "Track Order", href: "/guest-order-lookup" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
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
                    isActive(item.href)
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Cart and Mobile menu button */}
          <div className="flex items-center space-x-4">
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
                    isActive(item.href)
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-background"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
