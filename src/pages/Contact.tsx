import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - will integrate with Supabase later
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6 text-primary" />,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "pureihraam@gmail.com",
      action: "mailto:pureihraam@gmail.com"
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: "WhatsApp",
      description: "Quick questions? Message us on WhatsApp",
      contact: "+46720131476",
      action: "https://wa.me/46720131476"
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: "Call Us",
      description: "Speak directly with our customer service team",
      contact: "+46720131476",
      action: "tel:+46720131476"
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions about our Ihraam cloth or need assistance with your order? 
            We're here to help with your pilgrimage preparations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Get in Touch</h2>
            
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {method.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {method.description}
                      </p>
                      <a
                        href={method.action}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        {method.contact}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Business Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Business Hours</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-3">
                    All times are in Central European Time (CET)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Service Area</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Primary:</span> Sweden 🇸🇪</p>
                  <p><span className="font-medium">Extended:</span> Nordic Countries</p>
                  <p><span className="font-medium">International:</span> European Union</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is your message about?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide details about your inquiry..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    Send Message
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By submitting this form, you agree to our privacy policy. 
                    We'll only use your information to respond to your inquiry.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card className="bg-muted">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Is the Ihram suitable for tall/broad men?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, our generous size (115cm x 200cm each piece) is suitable for all body types, 
                    including tall and broad-shouldered men.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Do you also sell belts or sandals?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Not yet, but we're working on expanding our pilgrimage essentials collection. 
                    Belts and sandals coming soon, In Sha Allah.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Can mosques/travel groups order in bulk?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! We welcome bulk orders from mosques, travel agencies, and Hajj/Umrah groups. 
                    Contact us for special pricing on orders of 20+ sets.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    How long does shipping take?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Sweden: 3-7 business days, Nordic countries: 7-14 business days, EU: 7-14 business days. 
                    Free shipping on orders over 50€.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    What's included in the Ihraam set?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Two unstitched white cotton pieces: Izaar (lower garment) and Ridaa (upper garment), 
                    each measuring 115cm x 200cm.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Can I return or exchange?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, we offer returns within 30 days if unused and in original packaging. 
                    Your satisfaction is important to us.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;