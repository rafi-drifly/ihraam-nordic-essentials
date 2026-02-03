import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { calculateShipping, SHIPPING_RATES } from "@/lib/shipping";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
interface CartDrawerProps {
  onCheckout: () => void;
  checkingOut?: boolean;
}

export const CartDrawer = ({ onCheckout, checkingOut = false }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCart();
  const { t } = useTranslation();
  const location = useLocation();
  
  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {getTotalItems() > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {getTotalItems() === 0 ? "Your cart is empty" : `${getTotalItems()} item(s) in your cart`}
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
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.price}€ each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                  <span>Subtotal:</span>
                  <span>{getTotalPrice().toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                  <span>Shipping ({getTotalItems()} × €{SHIPPING_RATES.sweden}):</span>
                  <span>{calculateShipping(getTotalItems()).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">{(getTotalPrice() + calculateShipping(getTotalItems())).toFixed(2)}€</span>
                </div>
                <Link to={`${localePrefix}/cart`} className="block w-full mb-2">
                  <Button 
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
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