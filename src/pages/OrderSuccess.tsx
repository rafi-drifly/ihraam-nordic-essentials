import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight, Key } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [orderNumber] = useState(() => 
    `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
  );
  const [lookupToken] = useState(() => crypto.randomUUID());
  
  // All orders are guest orders now
  const isGuestOrder = true;

  useEffect(() => {
    // Clear cart after successful payment
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your order. We're preparing your Ihram for shipment.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Order Number:</span>
                <span className="font-mono text-sm bg-background px-2 py-1 rounded border">
                  {orderNumber}
                </span>
              </div>
            </div>
            
            {isGuestOrder && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-accent-foreground mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-accent-foreground mb-2">Save Your Lookup Token</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Since you checked out as a guest, use this token to lookup your order later:
                    </p>
                    <div className="bg-background p-3 rounded border">
                      <code className="text-sm font-mono break-all">{lookupToken}</code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Bookmark this page or save this token to track your order at{" "}
                      <Link to="/guest-order-lookup" className="text-primary hover:underline">
                        /guest-order-lookup
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>What happens next:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• You'll receive an order confirmation email shortly</li>
                <li>• We'll prepare and package your Ihraam with care</li>
                <li>• You'll get tracking information once shipped</li>
                <li>• Delivery typically takes 3-14 business days</li>
              </ul>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h3 className="font-semibold text-accent-foreground mb-2">Shipping Timeline</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>🇸🇪 Sweden:</span>
                  <span>3-7 business days</span>
                </div>
                <div className="flex justify-between">
                  <span>🇪🇺 Nordic & EU:</span>
                  <span>7-14 business days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            May this sacred garment serve you well on your pilgrimage to the Holy Land.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to="/shop">
                Continue Shopping
              </Link>
            </Button>
            <Button asChild className="bg-gradient-primary hover:opacity-90">
              <Link to="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your order, please don't hesitate to contact us.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;