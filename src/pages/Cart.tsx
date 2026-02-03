import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { calculateShipping, SHIPPING_RATES } from "@/lib/shipping";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DonationSection from "@/components/shop/DonationSection";

const Cart = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { toast } = useToast();
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [selectedDonation, setSelectedDonation] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  const getTotalWithDonation = () => {
    return getTotalPrice() + calculateShipping(getTotalItems()) + selectedDonation;
  };

  const handleCheckout = async () => {
    if (items.length === 0 || checkoutLoading) return;
    setCheckoutLoading(true);
    try {
      const checkoutItems = items.map(item => ({ id: item.id, quantity: item.quantity }));
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: checkoutItems,
          donation: selectedDonation > 0 ? selectedDonation : undefined
        }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: t('common.error'),
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to={`${localePrefix}/shop`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('cart.continueShopping')}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{t('cart.title')}</h1>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">{t('cart.empty')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('cart.emptyDesc')}
              </p>
              <Link to={`${localePrefix}/shop`}>
                <Button>{t('cart.startShopping')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-muted-foreground">{item.price}€ each</p>
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
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
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
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive ml-4"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('cart.orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>{t('cart.items', { count: getTotalItems() })}</span>
                    <span>{getTotalPrice().toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('cart.shipping')} ({getTotalItems()} × €{SHIPPING_RATES.sweden})</span>
                    <span>{calculateShipping(getTotalItems()).toFixed(2)}€</span>
                  </div>
                  {selectedDonation > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>{t('donation.checkout.lineItem')}</span>
                      <span>{selectedDonation.toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">{t('cart.total')}:</span>
                      <span className="font-bold text-lg">{getTotalWithDonation().toFixed(2)}€</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-primary hover:opacity-90" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? t('common.loading') : t('cart.checkout')}
                  </Button>
                </CardContent>
              </Card>

              {/* Donation Section */}
              <DonationSection 
                selectedDonation={selectedDonation}
                onDonationChange={setSelectedDonation}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;