import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, Star, Check } from "lucide-react";
import ihraamProduct from "@/assets/ihraam-product.jpg";
import ihraamWorn from "@/assets/ihraam-worn.jpg";

const Shop = () => {
  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const features = [
    "100% Premium Cotton",
    "Two-piece set (Izaar & Ridaa)",
    "Lightweight & Breathable",
    "Pre-washed & Ready to Use",
    "Suitable for All Seasons",
    "Machine Washable"
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <span>Home</span>
          <span>/</span>
          <span className="text-foreground">Shop</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-2xl overflow-hidden">
              <img
                src={ihraamProduct}
                alt="Pure Ihraam Cloth Set"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-muted rounded-xl overflow-hidden">
                <img
                  src={ihraamWorn}
                  alt="Ihraam worn by pilgrim"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                <span className="text-muted-foreground">Detail View</span>
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
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">(127 reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Pure Ihraam Cloth Set
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Premium quality Ihraam set made from 100% cotton. Lightweight, comfortable, 
                and perfectly suited for your sacred pilgrimage to Makkah.
              </p>
            </div>

            {/* Price */}
            <div className="border-t border-b border-border py-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">15€</span>
                <span className="text-lg text-muted-foreground">+ shipping</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Free shipping on orders over 50€
              </p>
            </div>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={decrementQuantity}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={incrementQuantity}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart - {(15 * quantity).toFixed(0)}€
                </Button>
                <Button variant="outline" size="lg" className="w-full">
                  Buy Now with Stripe
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
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-foreground mb-6">Product Description</h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-4">
                  Our Pure Ihraam cloth set is carefully crafted for the modern pilgrim who values 
                  both tradition and comfort. Made from premium 100% cotton, this two-piece set 
                  provides the perfect balance of breathability and durability needed for your 
                  sacred journey.
                </p>
                <p className="mb-4">
                  The set includes both the Izaar (lower garment) and Ridaa (upper garment), 
                  pre-cut to traditional specifications. The fabric is pre-washed and treated 
                  to ensure it maintains its pristine white appearance throughout your pilgrimage.
                </p>
                <p>
                  With the intention of making Hajj and Umrah accessible to all believers, 
                  we've priced this essential item at just 15€, ensuring that financial 
                  constraints don't become a barrier to your spiritual journey.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4">Size Guide</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Izaar (Lower):</span>
                  <span>115cm x 200cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Ridaa (Upper):</span>
                  <span>115cm x 200cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Fabric Weight:</span>
                  <span>Lightweight</span>
                </div>
                <div className="flex justify-between">
                  <span>Care:</span>
                  <span>Machine washable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;