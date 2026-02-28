import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, Gift } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { calculateShipping } from "@/lib/shipping";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/lib/analytics";

interface CartDrawerProps {
  onCheckout: () => void;
  checkingOut?: boolean;
}

export const CartDrawer = ({ onCheckout, checkingOut = false }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, addItem, getTotalItems, getTotalPrice } = useCart();
  const { t } = useTranslation();
  const location = useLocation();
  
  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  const totalItems = getTotalItems();
  const shipping = calculateShipping(totalItems);
  const subtotal = getTotalPrice();

  const handleUpsellClick = () => {
    trackEvent('cart_upsell_clicked', { currentQty: totalItems });
    if (items.length > 0) {
      const firstItem = items[0];
      addItem({ id: firstItem.id, name: firstItem.name, price: firstItem.price, image: firstItem.image }, 1);
    }
  };

  const renderUpsellBanner = () => {
    if (totalItems === 1) {
      return (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs font-medium">Add 1 more — keep shipping at €9</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleUpsellClick} className="text-xs h-7 px-2">+ Add</Button>
        </div>
      );
    }
    if (totalItems === 2) {
      return (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs font-medium">Add 1 more — <span className="text-primary font-bold">FREE delivery!</span></p>
          </div>
          <Button size="sm" variant="outline" onClick={handleUpsellClick} className="text-xs h-7 px-2">+ Add</Button>
        </div>
      );
    }
    return null;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item(s) in your cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some items to get started!</p>
            </div>
          ) : (
            <>
              {/* Upsell Banner */}
              {renderUpsellBanner()}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.price}€ each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-8 w-8 p-0">
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-8 w-8 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                  <span>Subtotal:</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                  <span>{shipping === 0 ? 'Shipping (Free! 🇸🇪)' : `Shipping (Sweden)`}:</span>
                  <span>{shipping === 0 ? 'FREE' : `${shipping.toFixed(2)}€`}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">{(subtotal + shipping).toFixed(2)}€</span>
                </div>
                <Link to={`${localePrefix}/cart`} className="block w-full mb-2">
                  <Button variant="outline" className="w-full" size="lg">
                    {t('cart.viewCart', 'View Cart')}
                  </Button>
                </Link>
                <Button 
                  onClick={onCheckout} 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  size="lg"
                  disabled={checkingOut}
                >
                  {checkingOut ? t('common.loading', 'Creating Checkout...') : t('cart.checkout', 'Proceed to Checkout')}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
