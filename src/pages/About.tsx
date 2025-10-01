import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Globe, Award } from "lucide-react";

const About = () => {
  const values = [
      {
        icon: <Heart className="h-8 w-8 text-primary" />,
        title: "Purity",
        description: "Every Ihram is prepared with the pure intention of earning reward in the Akhirah and serving the Muslim community with sincerity."
      },
      {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Accessibility", 
        description: "We believe every Muslim should have access to quality Ihram (Ihraam) cloth at 15€, regardless of their financial situation."
      },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Trust",
      description: "Building trust through consistent quality, reliable delivery, and transparent pricing across Sweden, Nordics, and Europe."
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About Pure Ihram
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            <strong>Pure Ihram was founded to make Ihram (Ihraam) affordable (15€ + shipping) and accessible to all.</strong> 
            This is not about profit but about earning ajr (reward) in the Akhirah by serving the Muslim community 
            and making the sacred pilgrimage accessible to believers across Europe.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Pure Ihram was born from a simple yet profound realization: too many Muslims 
                across Europe were struggling to find affordable, quality Ihram (Ihraam) cloth for their 
                pilgrimage to the holy cities of Makkah and Madinah.
              </p>
              <p>
                Having witnessed fellow believers paying excessive prices for basic pilgrimage 
                essentials, we made a commitment to provide premium Ihram cloth at an honest, 
                accessible price of just 15€.
              </p>
              <p>
                Our mission extends beyond commerce – every sale is made with the sincere intention 
                of earning ajr (reward) in the Akhirah while helping our brothers and sisters 
                fulfill their religious obligations without financial burden.
              </p>
              <p>
                Today, we're proud to serve thousands of pilgrims across Sweden, the Nordic 
                countries, and the European Union, ensuring that distance and cost never become 
                barriers to spiritual fulfillment.
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">Our Promise</h3>
            <blockquote className="text-lg italic text-muted-foreground leading-relaxed">
              "We promise to provide every Muslim with access to pure, comfortable Ihram (Ihraam) cloth 
              at a price that honors both quality and affordability. Our commitment is not just 
              to your pilgrimage, but to your spiritual journey and the barakah it brings."
            </blockquote>
            
            <div className="mt-8 p-6 bg-accent/10 rounded-lg">
              <blockquote className="text-lg italic text-foreground text-center mb-3">
                "The most beloved of people to Allah are those who are most beneficial to the people."
              </blockquote>
              <cite className="text-sm text-center text-muted-foreground block">— Al-Mu'jam al-Awsat</cite>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide every aspect of our business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Section */}
        <div className="bg-muted rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Why Quality Matters</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  During Hajj and Umrah, pilgrims face intense physical and spiritual demands. 
                  Your Ihram should be the least of your concerns – comfortable, breathable, 
                  and durable enough to withstand the journey ahead.
                </p>
                <p>
                  We source our fabric from trusted suppliers who understand the sacred nature 
                  of these garments. Every piece is inspected, pre-washed, and prepared with 
                  the care befitting its holy purpose.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Premium Cotton</h4>
                <p className="text-sm text-muted-foreground">
                  100% natural cotton fibers for maximum breathability and comfort
                </p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Pre-Treated</h4>
                <p className="text-sm text-muted-foreground">
                  Pre-washed and treated to maintain pristine appearance
                </p>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Traditional Cut</h4>
                <p className="text-sm text-muted-foreground">
                  Authentic dimensions following traditional Islamic guidelines
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;