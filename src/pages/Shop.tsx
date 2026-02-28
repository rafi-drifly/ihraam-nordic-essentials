import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Check, X, ChevronLeft, ChevronRight, Package, Truck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ihraamProduct from "@/assets/ihraam-product.jpg";
import detail2 from "@/assets/product/detail-2.avif";
import detail3 from "@/assets/product/detail-3.avif";
import detail4 from "@/assets/product/detail-4.avif";
import detail5 from "@/assets/product/detail-5.avif";
import detail6 from "@/assets/product/detail-6.avif";
import detail7 from "@/assets/product/detail-7.avif";
import detail8 from "@/assets/product/detail-8.avif";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { BUNDLES, getBundlePrice, type Bundle } from "@/lib/bundles";
import { calculateShipping, getShippingLabel } from "@/lib/shipping";
import { trackEvent } from "@/lib/analytics";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
}

const Shop = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const localePrefix = location.pathname.startsWith('/sv') ? '/sv' : location.pathname.startsWith('/no') ? '/no' : '';
  const { i18n } = useTranslation();
  
  const [selectedBundle, setSelectedBundle] = useState<number>(1); // index into BUNDLES, default to 2-Pack
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProduct();
    trackEvent('view_bundle_option');
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowLeft') navigatePrevious();
      else if (e.key === 'ArrowRight') navigateNext();
      else if (e.key === 'Escape') setSelectedImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImageIndex]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true).single();
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({ title: t('common.error'), description: "Failed to load product. Please refresh the page.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const bundle = BUNDLES[selectedBundle];

  const handleAddToCart = () => {
    if (!product) return;
    const eventName = bundle.qty === 1 ? 'add_to_cart_single' : bundle.qty === 2 ? 'add_to_cart_2pack' : 'add_to_cart_3pack';
    trackEvent(eventName, { qty: bundle.qty, price: bundle.totalPrice });
    
    addItem({
      id: product.id,
      name: product.name,
      price: bundle.totalPrice / bundle.qty, // store unit price for cart math
      image: ihraamProduct
    }, bundle.qty);
    toast({
      title: t('shop.addedToCart'),
      description: t('shop.addedToCartDesc', { quantity: bundle.qty, name: product.name })
    });
  };

  const handleCheckout = async () => {
    if (!product || checkoutLoading) return;
    trackEvent('checkout_started', { qty: bundle.qty, bundleType: bundle.label });
    setCheckoutLoading(true);
    try {
      const checkoutItems = [{ id: product.id, quantity: bundle.qty }];
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { items: checkoutItems, bundlePrice: bundle.totalPrice, locale: i18n.language }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({ title: t('common.error'), description: "Failed to create checkout session. Please try again.", variant: "destructive" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">{t('shop.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">{t('shop.notFound')}</p>
        </div>
      </div>
    );
  }

  const allImages = [ihraamProduct, detail2, detail3, detail4, detail5, detail6, detail7, detail8];
  const SITE_URL = "https://www.pureihram.com";
  
  const storageImages = (product.images && product.images.length > 0 && product.images[0].startsWith('http'))
    ? product.images
    : [`${SITE_URL}/og-image.jpg`];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": "Premium lightweight Ihram cloth for Hajj and Umrah. Soft, quick-dry, antimicrobial cotton towel set.",
    "image": storageImages,
    "brand": { "@type": "Brand", "name": "PureIhram" },
    "sku": "IHRAM-SET-001",
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/shop`,
      "priceCurrency": "EUR",
      "price": "20",
      "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": ["SE", "NO", "DK", "FI"] },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 7, "unitCode": "d" }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": ["SE", "NO", "DK", "FI"],
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility"
      }
    },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5", "reviewCount": "127" }
  };

  const navigateNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % allImages.length);
  };
  const navigatePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + allImages.length) % allImages.length);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} - Pure Ihram | Buy Online</title>
        <meta name="description" content="Premium Ihram sets from €20. Save with 2-Pack (€39) or 3-Pack (€57, free delivery in Sweden). Fast shipping across Nordics & EU." />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${product.name} - Pure Ihram`} />
        <meta property="og:description" content="Premium Ihram sets from €20. Save with bundles. Free delivery on 3-Pack in Sweden." />
        <meta property="og:image" content={storageImages[0]} />
        <meta property="og:url" content={`${SITE_URL}/shop`} />
        <meta property="product:price:amount" content="20" />
        <meta property="product:price:currency" content="EUR" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Image Lightbox */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-background/95 backdrop-blur">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-50 bg-background/80 hover:bg-background rounded-full" onClick={() => setSelectedImageIndex(null)}>
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 hover:bg-background rounded-full" onClick={navigatePrevious}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 hover:bg-background rounded-full" onClick={navigateNext}>
            <ChevronRight className="h-6 w-6" />
          </Button>
          {selectedImageIndex !== null && (
            <div className="p-4">
              <img src={allImages[selectedImageIndex]} alt={`Product view ${selectedImageIndex + 1}`} className="w-full h-auto rounded-lg max-h-[85vh] object-contain" />
              <div className="text-center mt-3 text-sm text-muted-foreground">{selectedImageIndex + 1} / {allImages.length}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
            <span>{t('shop.breadcrumb.home')}</span>
            <span>/</span>
            <span className="text-foreground">{t('shop.breadcrumb.shop')}</span>
          </nav>

          {/* Headline */}
          <div className="text-center mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              {t('shop.bundleHeading')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('shop.bundleSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setSelectedImageIndex(0)}>
                <img src={ihraamProduct} alt="Pure Ihram Hajj Towel Set" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[detail2, detail3, detail4, detail5, detail6, detail7, detail8].map((img, idx) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImageIndex(idx + 1)}>
                    <img src={img} alt={`Product detail ${idx + 2}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {t('shop.fastDelivery')}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
                    <span className="text-sm text-muted-foreground ml-1">(127 {t('shop.reviews')})</span>
                  </div>
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{product.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('shop.description')}</p>
              </div>

              {/* Bundle Cards */}
              <div className="space-y-3">
              <h3 className="font-semibold text-lg">{t('shop.bundle.chooseBundle')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {BUNDLES.map((b, idx) => {
                    const isSelected = selectedBundle === idx;
                    const totalYouPay = b.totalPrice + b.shipping;
                    const badgeKey = b.qty === 2 ? 'shop.bundle.bestValue' : b.qty >= 3 ? 'shop.bundle.freeDelivery' : '';
                    const labelKey = b.qty === 1 ? 'shop.bundle.single' : b.label;
                    return (
                      <button
                        key={b.qty}
                        onClick={() => setSelectedBundle(idx)}
                        className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border hover:border-primary/50 bg-background'
                        }`}
                      >
                        {badgeKey && (
                          <Badge
                            variant={b.badgeVariant || 'default'}
                            className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap"
                          >
                            {t(badgeKey)}
                          </Badge>
                        )}
                        <div className="mt-1">
                          <p className="font-bold text-lg">{b.qty === 1 ? t('shop.bundle.single') : b.label}</p>
                          <p className="text-2xl font-bold text-foreground mt-1">€{b.totalPrice}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {b.shipping === 0 ? (
                              <span className="text-primary font-medium">{t('shop.bundle.freeDelivery')} 🇸🇪</span>
                            ) : (
                              <span>+ €{b.shipping} {t('shop.bundle.delivery')} 🇸🇪</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Total: €{totalYouPay}
                          </p>
                          {b.savings > 0 && (
                            <p className="text-xs font-medium text-primary mt-1">
                              {t('shop.bundle.youSave', { amount: b.savings })}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trust Bullets */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{t('shop.bundle.trustSoft')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>{t('shop.bundle.trustShipping')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-primary" />
                  <span>{t('shop.bundle.trustMission')}</span>
                </div>
              </div>

              {/* Add to Cart / Buy Now */}
              <div className="space-y-3">
                <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" onClick={handleAddToCart} disabled={product.stock_quantity < bundle.qty}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t('shop.addToCart')} — €{bundle.totalPrice}
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={handleCheckout} disabled={product.stock_quantity < bundle.qty || checkoutLoading}>
                  {checkoutLoading ? t('shop.creatingCheckout') : t('shop.buyNow')}
                </Button>
              </div>

              {/* Specifications Table */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg" style={{ color: '#2C7A7B' }}>{t('shop.specifications.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">{t('shop.specifications.material')}</TableCell>
                        <TableCell>{t('shop.specifications.materialValue')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">{t('shop.specifications.size')}</TableCell>
                        <TableCell>{t('shop.specifications.sizeValue')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">{t('shop.specifications.weight')}</TableCell>
                        <TableCell>{t('shop.specifications.weightValue')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">{t('shop.specifications.features')}</TableCell>
                        <TableCell>{t('shop.specifications.featuresValue')}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">{t('shop.specifications.packaging')}</TableCell>
                        <TableCell>{t('shop.specifications.packagingValue')}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('shop.features.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['soft', 'quickDry', 'antimicrobial', 'sustainable', 'sunnah'].map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{t(`shop.features.${feature}.title`)}</p>
                          <p className="text-sm text-muted-foreground">{t(`shop.features.${feature}.description`)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{t('shop.shippingInfo.title')}</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>🇸🇪 1–2 sets: €9 delivery · 3+ sets: FREE delivery</li>
                    <li>🇪🇺 {t('shop.shippingInfo.nordic')}</li>
                    <li>📦 {t('shop.shippingInfo.tracking')}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Care Instructions */}
              <Card className="bg-accent/10">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2" style={{ color: '#2C7A7B' }}>{t('shop.careInstructions.title')}</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• {t('shop.careInstructions.wash')}</li>
                    <li>• {t('shop.careInstructions.bleach')}</li>
                    <li>• {t('shop.careInstructions.dry')}</li>
                    <li>• {t('shop.careInstructions.iron')}</li>
                  </ul>
                </CardContent>
              </Card>

              {/* Spiritual Reminder */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <h3 className="font-semibold mb-2 text-primary">{t('shop.spiritualReminder.title')}</h3>
                  <blockquote className="text-sm italic text-muted-foreground">
                    {t('shop.spiritualReminder.quote')}
                  </blockquote>
                  <cite className="text-xs text-muted-foreground block mt-1">{t('shop.spiritualReminder.cite')}</cite>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
