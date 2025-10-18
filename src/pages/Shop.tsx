import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Star, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GuestEmailModal } from "@/components/checkout/GuestEmailModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ihraamProduct from "@/assets/ihraam-product.jpg";
import ihraamWorn from "@/assets/ihraam-worn.jpg";
import detail1 from "@/assets/product/detail-1.avif";
import detail2 from "@/assets/product/detail-2.avif";
import detail3 from "@/assets/product/detail-3.avif";
import detail4 from "@/assets/product/detail-4.avif";
import detail5 from "@/assets/product/detail-5.avif";
import detail6 from "@/assets/product/detail-6.avif";
import detail7 from "@/assets/product/detail-7.avif";
import detail8 from "@/assets/product/detail-8.avif";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const {
    addItem
  } = useCart();
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchProduct();
  }, []);
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'ArrowLeft') {
        navigatePrevious();
      } else if (e.key === 'ArrowRight') {
        navigateNext();
      } else if (e.key === 'Escape') {
        setSelectedImageIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImageIndex]);
  const fetchProduct = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('products').select('*').eq('is_active', true).single();
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error",
        description: "Failed to load product. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: ihraamProduct
    }, quantity);
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`
    });
  };
  const handleCheckout = async () => {
    if (!product || checkoutLoading) return;

    // Always show email modal for guest checkout
    setShowEmailModal(true);
  };
  const handleGuestEmailSubmit = async (guestEmail: string) => {
    setShowEmailModal(false);
    await processCheckout(guestEmail);
  };
  const processCheckout = async (guestEmail?: string) => {
    if (!product) return;
    setCheckoutLoading(true);
    try {
      const checkoutItems = [{
        id: product.id,
        quantity: quantity
      }];
      const {
        data,
        error
      } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: checkoutItems,
          guestEmail
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
        title: "Checkout Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>;
  }
  if (!product) {
    return <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Product not found</p>
        </div>
      </div>;
  }
  const features = ["100% Premium Cotton", "Two-piece set (Izaar & Ridaa)", "Lightweight & Breathable", "Pre-washed & Ready to Use", "Suitable for All Seasons", "Machine Washable"];
  const allImages = [ihraamProduct, detail2, detail3, detail4, detail5, detail6, detail7, detail8];
  const navigateNext = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex + 1) % allImages.length);
  };
  const navigatePrevious = () => {
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((selectedImageIndex - 1 + allImages.length) % allImages.length);
  };
  return <>
      <GuestEmailModal open={showEmailModal} onOpenChange={setShowEmailModal} onSubmit={handleGuestEmailSubmit} />
      
      {/* Image Lightbox */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-5xl p-0 bg-background/95 backdrop-blur">
          <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-50 bg-background/80 hover:bg-background rounded-full" onClick={() => setSelectedImageIndex(null)}>
            <X className="h-4 w-4" />
          </Button>
          
          {/* Navigation Buttons */}
          <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 hover:bg-background rounded-full" onClick={navigatePrevious}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-background/80 hover:bg-background rounded-full" onClick={navigateNext}>
            <ChevronRight className="h-6 w-6" />
          </Button>

          {selectedImageIndex !== null && <div className="p-4">
              <img src={allImages[selectedImageIndex]} alt={`Product view ${selectedImageIndex + 1}`} className="w-full h-auto rounded-lg max-h-[85vh] object-contain" />
              <div className="text-center mt-3 text-sm text-muted-foreground">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </div>}
        </DialogContent>
      </Dialog>
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <span>Home</span>
          <span>/</span>
          <span className="text-foreground">Shop</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            
            
            {/* Detail Images Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImageIndex(1)}>
                <img src={detail2} alt="Ihram towel set packaged in eco-friendly zip carry bag" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImageIndex(2)}>
                <img src={detail3} alt="Quick-dry microfiber Ihram fabric detail" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImageIndex(3)}>
                <img src={detail4} alt="Ihram Hajj towel set white color" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImageIndex(4)}>
                <img src={detail5} alt="Soft and comfortable microfiber Ihram" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImageIndex(5)}>
                <img src={detail6} alt="Premium Ihram towel set for Hajj and Umrah" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImageIndex(6)}>
                <img src={detail7} alt="Lightweight Ihram for pilgrims" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedImageIndex(7)}>
                <img src={detail8} alt="Antimicrobial and hypoallergenic Ihram towel" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                  Fast Delivery
                </Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-accent text-accent" />)}
                  <span className="text-sm text-muted-foreground ml-1">(127 reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stay cool, clean, and comfortable on your sacred journey. The Pure Ihram Hajj Towel Set combines 
                Sunnah simplicity with modern microfiber performance — soft, absorbent, and made to last through 
                every step of Hajj or Umrah.
              </p>
            </div>

            {/* Price */}
            <div className="border-t border-b border-border py-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{product.price}€</span>
                <span className="text-lg text-muted-foreground">+ shipping</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Stock: {product.stock_quantity} available
              </p>
            </div>

            {/* Specifications Table */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg" style={{
                  color: '#2C7A7B'
                }}>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Material</TableCell>
                      <TableCell>100% Microfiber Polyester</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Size</TableCell>
                      <TableCell>115 × 230 cm</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Weight</TableCell>
                      <TableCell>1400 g (2 pieces)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Features</TableCell>
                      <TableCell>Quick-Dry • Antimicrobial • Hypoallergenic</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Packaging</TableCell>
                      <TableCell>Eco-friendly zip carry bag</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Soft & Comfortable</p>
                      <p className="text-sm text-muted-foreground">Smooth microfiber gentle on the skin</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Quick-Dry Technology</p>
                      <p className="text-sm text-muted-foreground">Absorbs moisture and dries rapidly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Antimicrobial Protection</p>
                      <p className="text-sm text-muted-foreground">Prevents bacterial buildup</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Sustainable & Reusable</p>
                      <p className="text-sm text-muted-foreground">Durable and easy to wash</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Sunnah-Compliant Design</p>
                      <p className="text-sm text-muted-foreground">Two unstitched white pieces symbolizing purity</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button variant="ghost" size="sm" onClick={decrementQuantity} className="h-10 w-10">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={incrementQuantity} className="h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" onClick={handleAddToCart} disabled={product.stock_quantity < quantity}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - {(product.price * quantity).toFixed(0)}€
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={handleCheckout} disabled={product.stock_quantity < quantity || checkoutLoading}>
                  {checkoutLoading ? "Creating Checkout..." : "Buy Now with Stripe"}
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <Card className="bg-muted">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>🇸🇪 Sweden: 3-7 business days</li>
                  <li>🇪🇺 Nordic & EU: 7-14 business days</li>
                  <li>📦 Secure packaging & tracking included</li>
                </ul>
              </CardContent>
            </Card>

            {/* Care Instructions */}
            <Card className="bg-accent/10">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2" style={{
                  color: '#2C7A7B'
                }}>Care Instructions</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Machine wash gentle cycle (≤ 40°C)</li>
                  <li>• Do not bleach</li>
                  <li>• Air-dry or tumble-dry low</li>
                  <li>• Avoid ironing directly on the fabric</li>
                </ul>
              </CardContent>
            </Card>

            {/* Spiritual Reminder */}
            <div className="bg-accent/10 rounded-lg p-6 border-l-4" style={{
              borderLeftColor: '#2C7A7B'
            }}>
              <blockquote className="text-base italic text-foreground mb-2">
                "Take provisions, but indeed, the best provision is Taqwa (God-consciousness)."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 2:197</cite>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>;
};
export default Shop;