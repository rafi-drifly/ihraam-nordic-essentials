import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, X, ChevronLeft, ChevronRight, Package, Truck, Globe, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EUROPE_COUNTRIES, COUNTRY_NAMES, countryFlag, requiresShippingDisclosure, type EuropeCountry } from "@/lib/shipping";
import { SHIPPING_DISCLOSURE, CUSTOMS_DISCLOSURE } from "@/lib/bundles";
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
import { trackEvent, trackViewItem, trackAddToCart, trackBeginCheckout } from "@/lib/analytics";

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
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const localePrefix = location.pathname.startsWith('/sv') ? '/sv' : location.pathname.startsWith('/no') ? '/no' : '';
  
  const bundles = BUNDLES;
  
  const [selectedBundle, setSelectedBundle] = useState<number>(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [shippingCountry, setShippingCountry] = useState<string>('SE');
  const { addItem } = useCart();
  const { toast } = useToast();
  
  const showDisclosure = requiresShippingDisclosure(shippingCountry);
  const disclosureLang = (i18n.language as 'en' | 'sv' | 'no') || 'en';
  const disclosureText = SHIPPING_DISCLOSURE[disclosureLang] || SHIPPING_DISCLOSURE.en;

  useEffect(() => {
    fetchProduct();
    trackViewItem({ id: 'ihram-set', name: 'Pure Ihram Set', price: 19 });
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

  const bundle = bundles[selectedBundle];

  const handleAddToCart = () => {
    if (!product) return;
    trackAddToCart({ id: 'ihram-set', name: 'Pure Ihram Set', price: bundle.totalPrice, quantity: bundle.qty });
    
    addItem({
      id: product.id,
      name: product.name,
      price: bundle.totalPrice / bundle.qty,
      image: ihraamProduct
    }, bundle.qty);
    toast({
      title: t('shop.addedToCart'),
      description: t('shop.addedToCartDesc', { quantity: bundle.qty, name: product.name })
    });
  };

  const handleCheckout = async () => {
    if (!product || checkoutLoading) return;
    trackBeginCheckout({ total: bundle.totalPrice, item_count: bundle.qty });
    setCheckoutLoading(true);
    try {
      const checkoutItems = [{ id: product.id, quantity: bundle.qty }];
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          items: checkoutItems, 
          bundlePrice: bundle.totalPrice, 
          locale: i18n.language,
          shippingCountry: shippingCountry
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

  const productDescriptionLong =
    i18n.language === 'sv'
      ? "Pure Ihrams set består av två lättviktiga vita mikrofiberhanddukar (Izaar och Ridaa) sydda speciellt för Hajj och Umrah. Tyget är snabbtorkande, andas väl och behåller en mjuk känsla mot huden även i Mekkas hetta. Varje set väger lite och får plats i en kabinväska, men håller måttet för dagliga tawaf, sa'i och böner. En passform passar de flesta vuxna män - knyt Izaar runt midjan och drapera Ridaa över axeln. Tvätta i 30 °C, hängtorka. Skickas från vårt lager i Sverige med spårning över hela EU. Ingår: två handdukar per set. Tillgänglig som single, 2-pack och 3-pack för familjer eller grupper. Designad och kvalitetskontrollerad i Norden för pilgrimer som vill ha trygghet, värdighet och enkelhet på sin resa."
      : i18n.language === 'no'
        ? "Pure Ihram-settet består av to lette hvite mikrofiberhåndklær (Izaar og Ridaa) sydd spesielt for Hajj og Umrah. Stoffet tørker raskt, puster godt og holder seg mykt mot huden, selv i Mekkas varme. Hvert sett er lett å pakke i en håndbagasje, men robust nok til daglig tawaf, sa'i og bønn. Én størrelse passer de fleste voksne menn - knytt Izaar rundt livet og drap Ridaa over skulderen. Vaskes på 30 °C, henges til tørk. Sendes fra vårt lager i Sverige med sporing til hele EU. Inkluderer: to håndklær per sett. Tilgjengelig som single, 2-pack og 3-pack for familier eller grupper. Designet og kvalitetssikret i Norden for pilegrimer som vil ha trygghet, verdighet og enkelhet på reisen."
        : "The Pure Ihram set consists of two lightweight white microfiber towels (Izaar and Ridaa) tailored specifically for Hajj and Umrah. The fabric is quick-drying, breathable, and stays soft against the skin even in Makkah's heat. Each set packs small enough for a carry-on yet holds up to daily tawaf, sa'i, and prayers. One size fits most adult men - tie the Izaar around the waist and drape the Ridaa over the shoulder. Machine wash at 30 °C, line dry. Ships from our warehouse in Sweden with tracked delivery across the entire EU. Includes: two towels per set. Available as a single, 2-pack, or 3-pack for families and groups. Designed and quality-checked in the Nordics for pilgrims who want peace of mind, dignity, and simplicity on their journey.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": productDescriptionLong,
    "image": storageImages,
    "brand": { "@type": "Brand", "name": "Pure Ihram" },
    "sku": "PI-IHRAM-SET-WHITE",
    "mpn": "PI-IHRAM-SET-WHITE",
    "category": "Religious Apparel > Hajj & Umrah > Ihram",
    "offers": {
      "@type": "Offer",
      "url": `${SITE_URL}/shop`,
      "priceCurrency": "EUR",
      "price": "19",
      "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": ["SE"] },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 7, "unitCode": "d" }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": ["SE"],
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 14,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility"
      }
    }
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
      <SEOHead
        title={
          i18n.language === 'sv'
            ? 'Köp Ihram-set - Single, 2-Pack & 3-Pack | Pure Ihram'
            : i18n.language === 'no'
              ? 'Kjøp Ihram-sett - Single, 2-Pack & 3-Pack | Pure Ihram'
              : 'Shop Ihram Sets - Single, 2-Pack & 3-Pack | Pure Ihram'
        }
        description={
          i18n.language === 'sv'
            ? 'Välj ditt Ihram-set: single (€19), 2-pack (€37) eller 3-pack (€55). Lätt mikrofiber, skickas från Sverige. Säker betalning via Stripe.'
            : i18n.language === 'no'
              ? 'Velg ditt Ihram-sett: single (€19), 2-pack (€37) eller 3-pack (€55). Lett mikrofiber, sendes fra Sverige. Sikker betaling med Stripe.'
              : 'Choose your Ihram set: single (€19), 2-pack (€37), or 3-pack (€55). Lightweight microfiber, ships from Sweden. Secure EU delivery.'
        }
        ogType="product"
        image={storageImages[0]}
        jsonLd={[jsonLd]}
      />

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

      <div className="py-8">
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
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{product.name}</h2>
                <p className="text-muted-foreground leading-relaxed">{t('shop.description')}</p>
              </div>

              {/* Bundle Cards - mirrors the homepage ProductOffersBlock */}
              <div className="space-y-3">
                <div className="text-center mb-2">
                  <h3
                    className="font-bold"
                    style={{
                      color: "#305050",
                      fontSize: "clamp(22px, 3vw, 28px)",
                      lineHeight: 1.2,
                    }}
                  >
                    {t('shop.bundle.chooseYourIhram')}
                  </h3>
                  <p
                    className="mx-auto mt-2"
                    style={{
                      color: "#6B7280",
                      fontSize: 14,
                      lineHeight: 1.5,
                      maxWidth: 480,
                    }}
                  >
                    {t('shop.bundle.chooseSubtitle')}
                  </p>
                </div>

                <div className="shop-offers-grid">
                  {bundles.map((b, idx) => {
                    const isSelected = selectedBundle === idx;
                    const isHighlighted = b.qty === 2;
                    const isBestValue = b.qty >= 3;
                    const mobileOrder = b.qty === 2 ? 1 : b.qty === 1 ? 2 : 3;
                    const descKey =
                      b.qty === 1 ? 'shop.bundle.descSingle' :
                      b.qty === 2 ? 'shop.bundle.desc2Pack' :
                      'shop.bundle.desc3Pack';
                    const ctaKey = b.qty === 1
                      ? 'shop.bundle.shopNow'
                      : 'shop.bundle.shopNPack';
                    return (
                      <button
                        key={b.qty}
                        type="button"
                        onClick={() => setSelectedBundle(idx)}
                        aria-pressed={isSelected}
                        aria-label={`${b.label}, €${b.totalPrice} plus shipping. ${t(descKey)}`}
                        className={`shop-offer-card ${isHighlighted ? 'shop-offer-card--highlighted' : ''} ${isSelected ? 'shop-offer-card--selected' : ''}`}
                        style={{ order: mobileOrder }}
                      >
                        {isHighlighted && (
                          <span
                            aria-hidden="true"
                            className="shop-offer-badge"
                            style={{ background: '#287777', color: '#FFFFFF' }}
                          >
                            {t('shop.bundle.mostPopular')}
                          </span>
                        )}
                        {isBestValue && (
                          <span
                            aria-hidden="true"
                            className="shop-offer-badge"
                            style={{ background: '#EEBD2B', color: '#1A1A1A' }}
                          >
                            {t('shop.bundle.bestValue')}
                          </span>
                        )}

                        <h4
                          className="text-center"
                          style={{
                            color: '#305050',
                            fontSize: 20,
                            fontWeight: 600,
                            marginBottom: 8,
                          }}
                        >
                          {b.qty === 1 ? t('shop.bundle.single') + ' Set' : b.label}
                        </h4>

                        <div className="text-center" style={{ marginBottom: 4 }}>
                          <span
                            style={{
                              color: '#305050',
                              fontSize: 36,
                              fontWeight: 700,
                              lineHeight: 1,
                            }}
                          >
                            €{b.totalPrice}
                          </span>
                          <span
                            style={{
                              color: '#6B7280',
                              fontSize: 12,
                              fontWeight: 400,
                              marginLeft: 4,
                            }}
                          >
                            {t('shop.plusShipping')}
                          </span>
                        </div>

                        {/* Reserve vertical space so all cards align */}
                        <div
                          className="text-center"
                          style={{ minHeight: 38, marginBottom: 8 }}
                        >
                          {b.savings > 0 && (
                            <>
                              <div
                                style={{ color: '#287777', fontSize: 14, fontWeight: 700 }}
                              >
                                {t('shop.bundle.saveAmount', { amount: b.savings })}
                              </div>
                              <div
                                style={{
                                  color: '#6B7280',
                                  fontSize: 11,
                                  fontWeight: 400,
                                  marginTop: 2,
                                }}
                              >
                                {t('shop.bundle.oneShippingFee')}
                              </div>
                            </>
                          )}
                        </div>

                        <p
                          className="text-center"
                          style={{
                            color: '#4B5563',
                            fontSize: 13,
                            lineHeight: 1.45,
                            marginBottom: 12,
                          }}
                        >
                          {t(descKey)}
                        </p>

                        <span
                          className="shop-offer-cta"
                          aria-hidden="true"
                        >
                          {b.qty === 1 ? t(ctaKey) : t(ctaKey, { label: b.label })}
                        </span>
                      </button>
                    );
                  })}
                </div>


                {/* Shipping note */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t('shop.bundle.shippingNote')}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    {t('shop.bundle.whyBundles')}
                  </p>
                </div>
              </div>

              {/* Scoped tier styling - matches homepage ProductOffersBlock */}
              <style>{`
                .shop-offers-grid {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 16px;
                }
                @media (min-width: 640px) {
                  .shop-offers-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                  }
                  .shop-offers-grid > .shop-offer-card { order: 0 !important; }
                }
                .shop-offer-card {
                  position: relative;
                  background: #FFFFFF;
                  border: 1px solid #E5E7EB;
                  border-radius: 14px;
                  padding: 20px 16px;
                  cursor: pointer;
                  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
                  display: flex;
                  flex-direction: column;
                  text-align: center;
                  width: 100%;
                  font-family: inherit;
                }
                .shop-offer-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
                }
                .shop-offer-card--highlighted {
                  border: 2px solid #287777;
                  box-shadow: 0 8px 24px rgba(40, 119, 119, 0.12);
                }
                .shop-offer-card--highlighted:hover {
                  transform: none;
                }
                .shop-offer-card--selected {
                  border-color: #287777;
                  box-shadow: 0 0 0 3px rgba(40, 119, 119, 0.18);
                }
                .shop-offer-badge {
                  position: absolute;
                  top: -12px;
                  left: 50%;
                  transform: translateX(-50%);
                  font-size: 11px;
                  font-weight: 600;
                  padding: 5px 12px;
                  border-radius: 999px;
                  white-space: nowrap;
                  letter-spacing: 0.01em;
                }
                .shop-offer-cta {
                  display: inline-block;
                  width: 100%;
                  padding: 10px 12px;
                  background: #287777;
                  color: #FFFFFF;
                  font-size: 14px;
                  font-weight: 600;
                  border-radius: 8px;
                  margin-top: auto;
                  transition: background-color 200ms ease;
                }
                .shop-offer-card:hover .shop-offer-cta { background: #205A5A; }
                .shop-offer-card:focus-visible {
                  outline: 3px solid #EEBD2B;
                  outline-offset: 2px;
                }
              `}</style>

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
                <Button size="lg" className="w-full bg-primary hover:bg-primary/90 transition-colors" onClick={handleAddToCart} disabled={product.stock_quantity < bundle.qty}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {t('shop.addToCart')} - {"\u20AC"}{bundle.totalPrice}
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={handleCheckout} disabled={product.stock_quantity < bundle.qty || checkoutLoading}>
                  {checkoutLoading ? t('shop.creatingCheckout') : t('shop.buyNow')}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {t('shop.trustLine', 'Shipped from Sweden · Secure checkout via Stripe')}
                </p>
              </div>

              {/* Collapsible Details */}
              <div className="space-y-2">
                <Accordion type="single" collapsible className="w-full">
                  {/* Specifications */}
                  <AccordionItem value="specs">
                    <AccordionTrigger className="text-base font-semibold">{t('shop.specifications.title')}</AccordionTrigger>
                    <AccordionContent>
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Features */}
                  <AccordionItem value="features">
                    <AccordionTrigger className="text-base font-semibold">{t('shop.features.title')}</AccordionTrigger>
                    <AccordionContent>
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Shipping Info */}
                  <AccordionItem value="shipping">
                    <AccordionTrigger className="text-base font-semibold">{t('shop.shippingInfo.title')}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          {t('shop.bundle.shippingNote')}
                        </li>
                        <li className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          {t('shop.shippingInfo.nordic')}
                        </li>
                        <li className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-primary" />
                          {t('shop.shippingInfo.tracking')}
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Care Instructions */}
                  <AccordionItem value="care">
                    <AccordionTrigger className="text-base font-semibold">{t('shop.careInstructions.title')}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {t('shop.careInstructions.wash')}</li>
                        <li>• {t('shop.careInstructions.bleach')}</li>
                        <li>• {t('shop.careInstructions.dry')}</li>
                        <li>• {t('shop.careInstructions.iron')}</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
