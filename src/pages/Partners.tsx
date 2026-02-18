import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { 
  Building2, 
  Users, 
  Plane, 
  ShoppingCart, 
  Store, 
  Heart,
  Package,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  Globe,
  Truck,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";

const Partners = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const localePrefix = location.pathname.startsWith('/sv') ? '/sv' : location.pathname.startsWith('/no') ? '/no' : '';
  
  const [formData, setFormData] = useState({
    name: "",
    organisation: "",
    role: "",
    country: "",
    email: "",
    phone: "",
    pilgrimsPerYear: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, pilgrimsPerYear: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('partner-inquiry', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: t('partners.form.successTitle'),
        description: t('partners.form.successMessage'),
      });
      
      setFormData({
        name: "",
        organisation: "",
        role: "",
        country: "",
        email: "",
        phone: "",
        pilgrimsPerYear: "",
        message: ""
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: t('partners.form.errorTitle'),
        description: t('partners.form.errorMessage'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const whoIsThisFor = [
    { icon: Building2, title: t('partners.whoFor.mosques.title'), description: t('partners.whoFor.mosques.description') },
    { icon: Plane, title: t('partners.whoFor.agencies.title'), description: t('partners.whoFor.agencies.description') },
    { icon: Users, title: t('partners.whoFor.organizers.title'), description: t('partners.whoFor.organizers.description') },
  ];

  const howItWorks = [
    { step: 1, icon: ShoppingCart, title: t('partners.howItWorks.step1.title'), description: t('partners.howItWorks.step1.description') },
    { step: 2, icon: Store, title: t('partners.howItWorks.step2.title'), description: t('partners.howItWorks.step2.description') },
    { step: 3, icon: Heart, title: t('partners.howItWorks.step3.title'), description: t('partners.howItWorks.step3.description') },
  ];

  const productFeatures = [
    t('partners.product.features.quickDry'),
    t('partners.product.features.soft'),
    t('partners.product.features.hypoallergenic'),
    t('partners.product.features.antimicrobial'),
    t('partners.product.features.durable'),
  ];

  const europeFeatures = [
    { icon: Truck, text: t('partners.europe.features.shipping') },
    { icon: Shield, text: t('partners.europe.features.quality') },
    { icon: Globe, text: t('partners.europe.features.support') },
  ];

  const seoTitle = i18n.language === 'sv' 
    ? 'Grossist Ihram för Moskéer & Hajj/Umrah-byråer | Pure Ihram'
    : i18n.language === 'no'
    ? 'Engros Ihram for Moskeer & Hajj/Umrah-byråer | Pure Ihram'
    : 'Wholesale Ihram for Mosques & Hajj/Umrah Agencies | Pure Ihram';
  
  const seoDescription = i18n.language === 'sv'
    ? 'Bli partner med Pure Ihram för att leverera högkvalitativa Ihram-set till era pilgrimer. Perfekt för moskéer och Hajj/Umrah-byråer i Europa med speciella grossistpriser.'
    : i18n.language === 'no'
    ? 'Bli partner med Pure Ihram for å levere høykvalitets Ihram-sett til deres pilegrimer. Perfekt for moskeer og Hajj/Umrah-byråer i Europa med spesielle engrospriser.'
    : 'Partner with Pure Ihram to supply high-quality Ihram sets to your pilgrims. Ideal for mosques and Hajj/Umrah agencies across Europe with special wholesale pricing.';

  return (
    <div className="min-h-screen">
      <SEOHead title={seoTitle} description={seoDescription} />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 lg:py-28">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_1px,transparent_1px)] bg-[length:24px_24px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Building2 className="h-4 w-4" />
              {t('partners.hero.badge')}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t('partners.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              {t('partners.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={scrollToForm} className="text-lg px-8 py-6">
                {t('partners.hero.ctaPrimary')}
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToForm} className="text-lg px-8 py-6">
                {t('partners.hero.ctaSecondary')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('partners.whoFor.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('partners.whoFor.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whoIsThisFor.map((item, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('partners.howItWorks.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('partners.howItWorks.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-background rounded-2xl p-8 text-center shadow-lg">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Example */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('partners.pricing.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('partners.pricing.subtitle')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 bg-primary/5">
                    <h3 className="text-2xl font-bold text-foreground mb-6">{t('partners.pricing.breakdown.title')}</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">{t('partners.pricing.breakdown.retail')}</span>
                        <span className="font-semibold text-foreground">€15</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">{t('partners.pricing.breakdown.partner')}</span>
                        <span className="font-semibold text-primary">€13*</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">{t('partners.pricing.breakdown.sellPrice')}</span>
                        <span className="font-semibold text-foreground">€18–€20</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-muted-foreground">{t('partners.pricing.breakdown.margin')}</span>
                        <span className="font-bold text-primary text-lg">€5–€7</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4 italic">
                      *{t('partners.pricing.breakdown.note')}
                    </p>
                  </div>
                  <div className="p-8 bg-primary text-primary-foreground flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-4">{t('partners.pricing.example.title')}</h3>
                    <p className="text-primary-foreground/90 mb-6">
                      {t('partners.pricing.example.description')}
                    </p>
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2">€500+</div>
                      <p className="text-primary-foreground/80">{t('partners.pricing.example.benefit')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('partners.product.title')}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t('partners.product.subtitle')}
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold text-foreground">{t('partners.product.name')}</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t('partners.product.specs.size')}</span>
                        <span className="font-medium text-foreground">115 × 230 cm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t('partners.product.specs.weight')}</span>
                        <span className="font-medium text-foreground">1400 g (2 pieces)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t('partners.product.specs.material')}</span>
                        <span className="font-medium text-foreground">100% {t('partners.product.specs.materialType')}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">{t('partners.product.featuresTitle')}</h4>
                    <ul className="space-y-3">
                      {productFeatures.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Based in Europe */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-4xl mb-4">
                <span>🇸🇪</span>
                <span>🇪🇺</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('partners.europe.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('partners.europe.description')}
              </p>
              <div className="space-y-4">
                {europeFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6">{t('partners.europe.coverage.title')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span>🇸🇪</span>
                  <span className="text-muted-foreground">Sweden</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🇳🇴</span>
                  <span className="text-muted-foreground">Norway</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🇩🇰</span>
                  <span className="text-muted-foreground">Denmark</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🇫🇮</span>
                  <span className="text-muted-foreground">Finland</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🇩🇪</span>
                  <span className="text-muted-foreground">Germany</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🇳🇱</span>
                  <span className="text-muted-foreground">Netherlands</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🇧🇪</span>
                  <span className="text-muted-foreground">Belgium</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🇪🇺</span>
                  <span className="text-muted-foreground">{t('partners.europe.coverage.allEU')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 lg:py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('partners.contact.title')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                {t('partners.contact.description')}
              </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('partners.contact.email')}</p>
                    <a href="mailto:support@pureihraam.com" className="text-primary hover:underline">
                      support@pureihraam.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('partners.contact.phone')}</p>
                    <a href="tel:+46720131476" className="text-primary hover:underline">
                      +46 720 131 476
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('partners.contact.location')}</p>
                    <p className="text-muted-foreground">Sweden, Europe</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('partners.form.name')} *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder={t('partners.form.namePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organisation">{t('partners.form.organisation')} *</Label>
                      <Input
                        id="organisation"
                        name="organisation"
                        value={formData.organisation}
                        onChange={handleChange}
                        required
                        placeholder={t('partners.form.organisationPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">{t('partners.form.role')}</Label>
                      <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        placeholder={t('partners.form.rolePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t('partners.form.country')} *</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder={t('partners.form.countryPlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('partners.form.email')} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder={t('partners.form.emailPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('partners.form.phone')}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={t('partners.form.phonePlaceholder')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pilgrimsPerYear">{t('partners.form.pilgrims')}</Label>
                    <Select value={formData.pilgrimsPerYear} onValueChange={handleSelectChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('partners.form.pilgrimsPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1–50</SelectItem>
                        <SelectItem value="51-100">51–100</SelectItem>
                        <SelectItem value="101-250">101–250</SelectItem>
                        <SelectItem value="251-500">251–500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('partners.form.message')}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder={t('partners.form.messagePlaceholder')}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t('partners.form.sending') : t('partners.form.submit')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partners;
