import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Package, RefreshCw, CheckCircle, Clock, Mail, DollarSign, Truck } from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  guest_email: string;
  total_amount: number;
  status: string;
  shipping_country: string;
  shipping_name: string;
  shipping_address: any;
  bundle_type: string;
  quantity: number;
  base_shipping_fee_eur: number;
  extra_shipping_fee_eur: number;
  extra_shipping_status: string;
  donation_amount: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  paid: "bg-green-500",
  shipped: "bg-blue-500",
  delivered: "bg-purple-500",
  cancelled: "bg-red-500",
};

const extraShippingColors: Record<string, string> = {
  not_required: "bg-gray-400",
  requested: "bg-yellow-500",
  paid: "bg-green-500",
  cancelled: "bg-red-500",
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [extraShippingAmount, setExtraShippingAmount] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pureihram_admin") !== "true") {
      navigate("/admin");
      return;
    }
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({ title: "Error loading orders", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleMarkReadyToShip = async (order: Order) => {
    try {
      await supabase
        .from('orders')
        .update({ 
          status: 'shipped',
          extra_shipping_status: 'not_required' 
        })
        .eq('id', order.id);
      
      toast({ title: "Order marked as ready to ship" });
      fetchOrders();
    } catch (error) {
      toast({ title: "Error updating order", variant: "destructive" });
    }
  };

  const handleRequestExtraShipping = async () => {
    if (!selectedOrder || !extraShippingAmount) return;
    
    const amount = parseFloat(extraShippingAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    setSendingEmail(true);
    try {
      // Create extra shipping payment session
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-extra-shipping-payment', {
        body: { orderId: selectedOrder.id, extraAmount: amount }
      });

      if (paymentError) throw paymentError;

      // Send email to customer
      const { error: emailError } = await supabase.functions.invoke('send-shipping-adjustment-email', {
        body: { 
          orderId: selectedOrder.id, 
          paymentUrl: paymentData.url,
          extraAmount: amount 
        }
      });

      if (emailError) throw emailError;

      toast({ title: "Extra shipping request sent to customer" });
      setSelectedOrder(null);
      setExtraShippingAmount("");
      fetchOrders();
    } catch (error) {
      console.error("Error requesting extra shipping:", error);
      toast({ title: "Error sending request", variant: "destructive" });
    }
    setSendingEmail(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("pureihram_admin");
    navigate("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const paidOrders = orders.filter(o => o.status === 'paid');
  const europeOrders = paidOrders.filter(o => o.shipping_country && o.shipping_country !== 'SE');

  return (
    <div className="min-h-screen bg-muted/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Order Management</h1>
            <Link to="/admin/inventory">
              <Button variant="outline" size="sm">
                <Package className="w-4 h-4 mr-2" />
                Inventory
              </Button>
            </Link>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-3xl font-bold">{orders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Paid (Awaiting Ship)</p>
              <p className="text-3xl font-bold text-green-600">{paidOrders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Europe Orders</p>
              <p className="text-3xl font-bold text-blue-600">{europeOrders.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Awaiting Extra Shipping</p>
              <p className="text-3xl font-bold text-yellow-600">
                {orders.filter(o => o.extra_shipping_status === 'requested').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-medium">{order.order_number}</span>
                        <Badge className={statusColors[order.status] || "bg-gray-500"}>
                          {order.status}
                        </Badge>
                        {order.shipping_country && order.shipping_country !== 'SE' && (
                          <Badge variant="outline" className="border-blue-500 text-blue-600">
                            🌍 {order.shipping_country}
                          </Badge>
                        )}
                        {order.shipping_country === 'SE' && (
                          <Badge variant="outline">🇸🇪 SE</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer:</span>
                        <p className="font-medium">{order.guest_email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bundle:</span>
                        <p className="font-medium">{order.bundle_type || 'N/A'} ({order.quantity || 1}x)</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Paid:</span>
                        <p className="font-medium">€{order.total_amount?.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Shipping:</span>
                        <p className="font-medium">
                          Base €{order.base_shipping_fee_eur || 9}
                          {order.extra_shipping_fee_eur > 0 && (
                            <span className="text-yellow-600"> + €{order.extra_shipping_fee_eur} extra</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {order.shipping_address && (
                      <div className="text-sm bg-muted/50 p-2 rounded">
                        <span className="text-muted-foreground">Ship to: </span>
                        {order.shipping_name || order.shipping_address.name}, {order.shipping_address.line1}, {order.shipping_address.city}, {order.shipping_address.postal_code}, {order.shipping_address.country}
                      </div>
                    )}

                    {order.extra_shipping_status !== 'not_required' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Extra Shipping:</span>
                        <Badge className={extraShippingColors[order.extra_shipping_status] || "bg-gray-400"}>
                          {order.extra_shipping_status}
                        </Badge>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {order.status === 'paid' && order.extra_shipping_status !== 'requested' && (
                        <>
                          <Button size="sm" onClick={() => handleMarkReadyToShip(order)}>
                            <Truck className="w-4 h-4 mr-1" />
                            Mark Shipped
                          </Button>
                          {order.shipping_country && order.shipping_country !== 'SE' && (
                            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                              <DollarSign className="w-4 h-4 mr-1" />
                              Request Extra Shipping
                            </Button>
                          )}
                        </>
                      )}
                      {order.extra_shipping_status === 'requested' && (
                        <span className="flex items-center gap-2 text-sm text-yellow-600">
                          <Clock className="w-4 h-4" />
                          Awaiting customer payment
                        </span>
                      )}
                      {order.extra_shipping_status === 'paid' && order.status === 'paid' && (
                        <Button size="sm" onClick={() => handleMarkReadyToShip(order)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Extra Paid - Mark Shipped
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extra Shipping Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Extra Shipping Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Order: <span className="font-medium">{selectedOrder?.order_number}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Customer: <span className="font-medium">{selectedOrder?.guest_email}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Country: <span className="font-medium">{selectedOrder?.shipping_country}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Base shipping paid: <span className="font-medium">€{selectedOrder?.base_shipping_fee_eur || 9}</span>
              </p>
              <div>
                <label className="text-sm font-medium">Extra shipping amount (EUR)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 5.00"
                  value={extraShippingAmount}
                  onChange={(e) => setExtraShippingAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRequestExtraShipping} 
                disabled={sendingEmail || !extraShippingAmount}
              >
                {sendingEmail ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Send Payment Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminOrders;
