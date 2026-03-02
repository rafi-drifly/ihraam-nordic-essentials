import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Minus, Plus, Trash2, Gift, Tag, X, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { calculateShipping } from "@/lib/shipping";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { trackEvent } from "@/lib/analytics";
import { useToast } from "@/hooks/use-toast";

interface CartDrawerProps {
  onCheckout: (promoCode?: string, shippingCity?: string) => void;
  checkingOut?: boolean;
}

export const CartDrawer = ({ onCheckout, checkingOut = false }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, addItem, getTotalItems, getTotalPrice } = useCart();
  const { t } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoCity, setPromoCity] = useState("");
  const [showCityInput, setShowCityInput] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  
  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  const totalItems = getTotalItems();
  const promoFreeShipping = appliedPromo === 'FREEDELIVERY-UPPSALA' && promoCity.toLowerCase().trim() === 'uppsala';
  const shipping = promoFreeShipping ? 0 : calculateShipping(totalItems);
  const subtotal = getTotalPrice();

  const destLabel = t('shop.destination.sweden');

  const handleApplyPromo = () => {
    setPromoError(null);
    const code = promoInput.trim().toUpperCase();
    if (code === 'FREEDELIVERY-UPPSALA') {
      setShowCityInput(true);
    } else {
      setPromoError(t('cart.promo.invalidCode'));
    }
  };

  const handleConfirmCity = () => {
    setPromoError(null);
    if (promoCity.toLowerCase().trim() === 'uppsala') {
      setAppliedPromo('FREEDELIVERY-UPPSALA');
      setShowCityInput(false);
      toast({ title: t('cart.promo.applied') });
    } else {
      setPromoError(t('cart.promo.invalidCity'));
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
    setPromoCity("");
    setShowCityInput(false);
    setPromoError(null);
  };

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
            <p className="text-xs font-medium">{t('cart.upsell.seQty1')}</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleUpsellClick} className="text-xs h-7 px-2">{t('cart.upsell.switchTo2Pack')}</Button>
        </div>
      );
    }
    if (totalItems === 2) {
      return (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs font-medium">{t('cart.upsell.seQty2')}</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleUpsellClick} className="text-xs h-7 px-2">{t('cart.upsell.switchTo3Pack')}</Button>
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
          <SheetTitle>{t('cart.title', 'Shopping Cart')}</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? t('cart.empty', 'Your cart is empty') : `${totalItems} item(s) in your cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('cart.empty', 'Your cart is empty')}</p>
              <p className="text-sm">{t('cart.emptyDesc', 'Add some items to get started!')}</p>
            </div>
          ) : (
            <>
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
                  <span>{t('cart.subtotal', 'Subtotal')}:</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-1">
                  <span>
                    {promoFreeShipping
                      ? t('cart.promo.freeDelivery')
                      : `${t('cart.shippingTo', { country: destLabel })}`
                    }:
                  </span>
                  <span>{shipping === 0 ? 'FREE' : `${shipping.toFixed(2)}€`}</span>
                </div>

                {/* Compact promo code */}
                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded border border-primary/30 bg-primary/5 p-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium">{appliedPromo}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemovePromo} className="h-5 w-5 p-0">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1 mb-2">
                    <div className="flex gap-1">
                      <Input
                        placeholder={t('cart.promo.placeholder')}
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        className="text-xs h-7"
                      />
                      <Button variant="outline" size="sm" onClick={handleApplyPromo} disabled={!promoInput.trim()} className="h-7 px-2 text-xs">
                        <Tag className="h-3 w-3" />
                      </Button>
                    </div>
                    {showCityInput && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">{t('cart.promo.cityLabel')}</label>
                        <div className="flex gap-1">
                          <Input
                            placeholder={t('cart.promo.cityPlaceholder')}
                            value={promoCity}
                            onChange={(e) => setPromoCity(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmCity()}
                            className="text-xs h-7"
                          />
                          <Button variant="outline" size="sm" onClick={handleConfirmCity} disabled={!promoCity.trim()} className="h-7 px-2">
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {promoError && <p className="text-xs text-destructive">{promoError}</p>}
                  </div>
                )}

                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold">{t('cart.total', 'Total')}:</span>
                  <span className="font-bold text-lg">{(subtotal + shipping).toFixed(2)}€</span>
                </div>
                <Link to={`${localePrefix}/cart`} className="block w-full mb-2">
                  <Button variant="outline" className="w-full" size="lg">
                    {t('cart.viewCart', 'View Cart')}
                  </Button>
                </Link>
                <Button 
                  onClick={() => onCheckout(appliedPromo || undefined, appliedPromo ? promoCity : undefined)} 
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
