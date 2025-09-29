import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Package, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  guest_email: string;
  shipping_address: any;
  created_at: string;
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
      description: string;
      price: number;
      images: string[];
    };  
  }>;
  payments: Array<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    created_at: string;
  }>;
}

const GuestOrderLookup = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [lookupToken, setLookupToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const { toast } = useToast();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim() || !lookupToken.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both order number and lookup token.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Looking up guest order:", { orderNumber, lookupToken: "***" });
      
      const { data, error } = await supabase.functions.invoke('guest-order-lookup', {
        body: { 
          orderNumber: orderNumber.trim(),
          lookupToken: lookupToken.trim()
        }
      });

      console.log("Lookup response:", { data, error });

      if (error) {
        console.error("Lookup error:", error);
        toast({
          title: "Lookup Failed",
          description: error.message || "Unable to lookup order.",
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data?.order) {
        setOrderData(data.order);
        toast({
          title: "Order Found",
          description: "Your order details have been loaded successfully.",
        });
      } else {
        toast({
          title: "Order Not Found",
          description: "Please check your order number and lookup token.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error looking up order:", error);
      toast({
        title: "Lookup Error",
        description: "An error occurred while looking up your order.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Guest Order Lookup</h1>
          <p className="text-muted-foreground">
            Enter your order number and lookup token to view your order details
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Order Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder="ORD-20250101-12345"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lookupToken">Lookup Token</Label>
                <Input
                  id="lookupToken"
                  type="text"
                  placeholder="Your lookup token from the order confirmation"
                  value={lookupToken}
                  onChange={(e) => setLookupToken(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  This token was provided in your order confirmation after purchase
                </p>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Looking up order..." : "Lookup Order"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {orderData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Order Number:</span>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded mt-1">
                      {orderData.order_number}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(orderData.status)}
                      <span className="font-medium">{formatStatus(orderData.status)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Total Amount:</span>
                    <p className="text-lg font-semibold mt-1">
                      {formatPrice(orderData.total_amount, orderData.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Order Date:</span>
                    <p className="mt-1">
                      {new Date(orderData.created_at).toLocaleDateString('en-EU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {orderData.guest_email && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <p className="mt-1">{orderData.guest_email}</p>
                  </div>
                )}

                {orderData.shipping_address && Object.keys(orderData.shipping_address).length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Shipping Address:</span>
                    <div className="mt-1 text-sm bg-muted p-3 rounded">
                      {orderData.shipping_address.name && <p className="font-medium">{orderData.shipping_address.name}</p>}
                      {orderData.shipping_address.line1 && <p>{orderData.shipping_address.line1}</p>}
                      {orderData.shipping_address.line2 && <p>{orderData.shipping_address.line2}</p>}
                      {orderData.shipping_address.city && (
                        <p>
                          {orderData.shipping_address.postal_code} {orderData.shipping_address.city}
                        </p>
                      )}
                      {orderData.shipping_address.country && <p>{orderData.shipping_address.country}</p>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.order_items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.products.name}</h3>
                        {item.products.description && (
                          <p className="text-sm text-muted-foreground">{item.products.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>Quantity: {item.quantity}</span>
                          <span>Unit Price: {formatPrice(item.unit_price, orderData.currency)}</span>
                          <span className="font-medium">
                            Total: {formatPrice(item.total_price, orderData.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {orderData.payments && orderData.payments.length > 0 && (
              <Card>
                <CardHeader>  
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orderData.payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-muted rounded">
                        <div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            <span className="font-medium">{formatStatus(payment.status)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(payment.created_at).toLocaleDateString('en-EU')}
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatPrice(payment.amount, payment.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you can't find your order or need assistance, please contact our support team.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GuestOrderLookup;