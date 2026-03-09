import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Package, Plus, Minus, RefreshCw, ArrowLeft, AlertTriangle } from "lucide-react";

interface Inventory {
  product_key: string;
  stock_on_hand: number;
  low_stock_threshold: number;
  updated_at: string;
}

interface StockMovement {
  id: string;
  product_key: string;
  delta: number;
  reason: string;
  created_at: string;
}

const AdminInventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [newThreshold, setNewThreshold] = useState("");

  useEffect(() => {
    if (localStorage.getItem("pureihram_admin") !== "true") {
      navigate("/admin");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch inventory
      const { data: inv } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_key', 'ihram_set')
        .single();
      
      if (inv) setInventory(inv);

      // Fetch recent movements
      const { data: mvts } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('product_key', 'ihram_set')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (mvts) setMovements(mvts);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
    setLoading(false);
  };

  const handleAdjustStock = async (type: 'add' | 'remove') => {
    const amount = parseInt(adjustAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    const delta = type === 'add' ? amount : -amount;
    const newStock = (inventory?.stock_on_hand || 0) + delta;

    if (newStock < 0) {
      toast({ title: "Cannot have negative stock", variant: "destructive" });
      return;
    }

    try {
      // Update inventory
      await supabase
        .from('inventory')
        .update({ stock_on_hand: newStock })
        .eq('product_key', 'ihram_set');

      // Log movement
      await supabase
        .from('stock_movements')
        .insert({
          product_key: 'ihram_set',
          delta: delta,
          reason: 'manual_adjustment',
        });

      toast({ title: `Stock ${type === 'add' ? 'added' : 'removed'} successfully` });
      setAdjustAmount("");
      fetchData();
    } catch (error) {
      toast({ title: "Error updating stock", variant: "destructive" });
    }
  };

  const handleUpdateThreshold = async () => {
    const threshold = parseInt(newThreshold);
    if (!threshold || threshold < 0) {
      toast({ title: "Invalid threshold", variant: "destructive" });
      return;
    }

    try {
      await supabase
        .from('inventory')
        .update({ low_stock_threshold: threshold })
        .eq('product_key', 'ihram_set');

      toast({ title: "Threshold updated" });
      setNewThreshold("");
      fetchData();
    } catch (error) {
      toast({ title: "Error updating threshold", variant: "destructive" });
    }
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

  const isLowStock = inventory && inventory.stock_on_hand <= inventory.low_stock_threshold;

  return (
    <div className="min-h-screen bg-muted/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Orders
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Inventory Management</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stock Overview */}
        <Card className={isLowStock ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Ihram Set Stock
              {isLowStock && (
                <span className="flex items-center gap-1 text-destructive text-sm font-normal">
                  <AlertTriangle className="w-4 h-4" />
                  Low Stock!
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Stock on Hand</p>
                <p className={`text-4xl font-bold ${isLowStock ? 'text-destructive' : 'text-primary'}`}>
                  {inventory?.stock_on_hand || 0}
                </p>
              </div>
              <div className="text-center p-6 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Low Stock Threshold</p>
                <p className="text-4xl font-bold">{inventory?.low_stock_threshold || 20}</p>
              </div>
              <div className="text-center p-6 bg-background rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <p className="text-lg font-medium">
                  {inventory?.updated_at 
                    ? new Date(inventory.updated_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adjust Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Adjust Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="number"
                placeholder="Amount"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className="w-full sm:w-32"
                min="1"
              />
              <Button onClick={() => handleAdjustStock('add')} className="flex-1 sm:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
              <Button 
                onClick={() => handleAdjustStock('remove')} 
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Minus className="w-4 h-4 mr-2" />
                Remove Stock
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Update Threshold */}
        <Card>
          <CardHeader>
            <CardTitle>Update Low Stock Threshold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="number"
                placeholder="New threshold"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                className="w-full sm:w-32"
                min="0"
              />
              <Button onClick={handleUpdateThreshold} variant="outline">
                Update Threshold
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {movements.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No movements yet</p>
            ) : (
              <div className="space-y-2">
                {movements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <span className={`font-medium ${m.delta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {m.delta > 0 ? '+' : ''}{m.delta}
                      </span>
                      <span className="text-muted-foreground ml-2 text-sm">
                        ({m.reason.replace('_', ' ')})
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminInventory;
