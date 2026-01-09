import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { calculateShipping, SHIPPING_RATES } from "@/lib/shipping";

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice } = useCart();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/shop">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some items to your cart to get started.
              </p>
              <Link to="/shop">
                <Button>Start Shopping</Button>
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
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Items ({getTotalItems()})</span>
                    <span>{getTotalPrice().toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping ({getTotalItems()} × €{SHIPPING_RATES.sweden})</span>
                    <span>{calculateShipping(getTotalItems()).toFixed(2)}€</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total:</span>
                      <span className="font-bold text-lg">{(getTotalPrice() + calculateShipping(getTotalItems())).toFixed(2)}€</span>
                    </div>
                  </div>
                  <Link to="/shop">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;