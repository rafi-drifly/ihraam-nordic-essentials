import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Check, Truck, Heart, Star } from "lucide-react";
import ihraamProduct from "@/assets/ihraam-product.jpg";
import ihraamWorn from "@/assets/ihraam-worn.jpg";
import heroPattern from "@/assets/hero-pattern.jpg";

const Home = () => {
  const benefits = [
    {
      icon: <Check className="h-6 w-6 text-primary" />,
      title: "Lightweight & Comfortable",
      description: "Made from premium cotton, thin and breathable for maximum comfort during your pilgrimage."
    },
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: "Made with Intention",
      description: "Every piece is prepared with the sincere intention of reward in the Akhirah and accessibility for all."
    },
    {
      icon: <Truck className="h-6 w-6 text-primary" />,
      title: "Fast EU Delivery",
      description: "Quick delivery across Sweden (3-7 days) and all Nordic/EU countries (7-14 days)."
    },
    {
      icon: <Star className="h-6 w-6 text-primary" />,
      title: "Affordable Quality",
      description: "High-quality Ihraam at just 15€ + shipping, making it accessible for every pilgrim."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-hero py-20 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)), url(${heroPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Pure & Comfortable
                <span className="block text-primary">Ihraam</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                Only <span className="font-bold text-accent">15€</span> + shipping
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Lightweight, thin, and comfortable Ihraam cloth for your sacred journey. 
                Made with the intention of earning ajr and making pilgrimage accessible to all.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <Link to="/shop">Order Your Ihraam</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Product Images */}
            <div className="animate-slide-up">
              <div className="relative">
                <img
                  src={ihraamProduct}
                  alt="Pure white Ihraam cloth laid flat"
                  className="rounded-2xl shadow-2xl w-full"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white rounded-2xl shadow-xl p-4 hidden md:block">
                  <img
                    src={ihraamWorn}
                    alt="Ihraam worn by pilgrim"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Ihraam?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Designed with the pilgrim's comfort and spiritual focus in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Ready for Your Spiritual Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Join thousands of pilgrims who trust Pure Ihraam for their sacred journey. 
            Fast delivery across Sweden, Nordics, and Europe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
              <Link to="/shop">Order Now - 15€</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/shipping">View Shipping Info</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;