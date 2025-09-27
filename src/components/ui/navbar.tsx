import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleCheckout = async () => {
    const cartItems = JSON.parse(localStorage.getItem('ihraam-cart') || '[]');
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // If not logged in, ask for a guest email
    let guestEmail: string | undefined = undefined;
    if (!user?.email) {
      guestEmail = window.prompt("Enter your email for receipts and order updates:");
      if (!guestEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        alert("A valid email is required to continue.");
        return;
      }
    }

    setCheckingOut(true);
    try {
      console.log('Starting checkout with items:', cartItems);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: cartItems.map((item: any) => ({ id: item.id, quantity: item.quantity })),
          guestEmail
        }
      });

      console.log('Checkout response:', { data, error });

      if (error) {
        console.error('Checkout error:', error);
        alert(`Checkout failed: ${error.message}`);
        return;
      }

      if (data?.url) {
        // Clear cart after successful checkout
        localStorage.removeItem('ihraam-cart');
        window.location.href = data.url;
      } else {
        alert('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert(`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCheckingOut(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Shipping", href: "/shipping" },
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
            <span className="text-xl font-bold text-foreground">Pure Ihraam</span>
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
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:ml-2 sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
                <User className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">Sign In</span>
              </Button>
            )}

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
      
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </nav>
  );
};

export default Navbar;