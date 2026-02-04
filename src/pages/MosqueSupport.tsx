import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, ArrowLeft, Check, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const MosqueSupport = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    mosqueName: "",
    countryCity: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    estimatedNeed: "",
    notes: ""
  });

  const getLocalePrefix = () => {
    if (location.pathname.startsWith('/sv')) return '/sv';
    if (location.pathname.startsWith('/no')) return '/no';
    return '';
  };
  const localePrefix = getLocalePrefix();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.mosqueName || !formData.countryCity || !formData.contactPerson || 
        !formData.email || !formData.phone || !formData.estimatedNeed) {
      toast({
        title: t('common.error'),
        description: t('mosqueSupport.form.requiredFields'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use contact-form edge function for now
      const { error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.contactPerson,
          email: formData.email,
          subject: `Mosque Support Request: ${formData.mosqueName}`,
          message: `
Mosque/Islamic Center: ${formData.mosqueName}
Location: ${formData.countryCity}
Contact Person: ${formData.contactPerson}
Email: ${formData.email}
Phone: ${formData.phone}
Website: ${formData.website || 'N/A'}
Estimated Need: ${formData.estimatedNeed} sets
Additional Notes: ${formData.notes || 'N/A'}
          `.trim()
        }
      });

      if (error) throw error;
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting mosque request:', error);
      toast({
        title: t('common.error'),
        description: t('mosqueSupport.form.error'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>{t('mosqueSupport.seoTitle')}</title>
        </Helmet>
        <div className="min-h-screen py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t('mosqueSupport.success.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {t('mosqueSupport.success.message')}
            </p>
            <Card className="border-primary/20 bg-primary/5 mb-8">
              <CardContent className="p-6">
                <p className="text-sm italic text-muted-foreground">
                  {t('mosqueSupport.success.dua')}
                </p>
              </CardContent>
            </Card>
            <Button asChild>
              <Link to={`${localePrefix}/`}>
                {t('mosqueSupport.success.backHome')}
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('mosqueSupport.seoTitle')}</title>
        <meta name="description" content={t('mosqueSupport.seoDescription')} />
      </Helmet>

      <div className="min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`${localePrefix}/support-our-mission`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('mosqueSupport.backToDonation')}
              </Link>
            </Button>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t('mosqueSupport.hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('mosqueSupport.hero.subtitle')}
            </p>
          </div>

          {/* How It Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">{t('mosqueSupport.howItWorks.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">1</div>
                  <div>
                    <p className="font-medium text-sm">{t('mosqueSupport.howItWorks.step1.title')}</p>
                    <p className="text-xs text-muted-foreground">{t('mosqueSupport.howItWorks.step1.desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">2</div>
                  <div>
                    <p className="font-medium text-sm">{t('mosqueSupport.howItWorks.step2.title')}</p>
                    <p className="text-xs text-muted-foreground">{t('mosqueSupport.howItWorks.step2.desc')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">3</div>
                  <div>
                    <p className="font-medium text-sm">{t('mosqueSupport.howItWorks.step3.title')}</p>
                    <p className="text-xs text-muted-foreground">{t('mosqueSupport.howItWorks.step3.desc')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('mosqueSupport.form.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="mosqueName">{t('mosqueSupport.form.mosqueName')} *</Label>
                    <Input
                      id="mosqueName"
                      value={formData.mosqueName}
                      onChange={(e) => handleChange('mosqueName', e.target.value)}
                      placeholder={t('mosqueSupport.form.mosqueNamePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countryCity">{t('mosqueSupport.form.countryCity')} *</Label>
                    <Input
                      id="countryCity"
                      value={formData.countryCity}
                      onChange={(e) => handleChange('countryCity', e.target.value)}
                      placeholder={t('mosqueSupport.form.countryCityPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">{t('mosqueSupport.form.contactPerson')} *</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => handleChange('contactPerson', e.target.value)}
                      placeholder={t('mosqueSupport.form.contactPersonPlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('mosqueSupport.form.email')} *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder={t('mosqueSupport.form.emailPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t('mosqueSupport.form.phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder={t('mosqueSupport.form.phonePlaceholder')}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">{t('mosqueSupport.form.website')}</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      placeholder={t('mosqueSupport.form.websitePlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedNeed">{t('mosqueSupport.form.estimatedNeed')} *</Label>
                  <Select value={formData.estimatedNeed} onValueChange={(value) => handleChange('estimatedNeed', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('mosqueSupport.form.estimatedNeedPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 {t('mosqueSupport.form.sets')}</SelectItem>
                      <SelectItem value="25">25 {t('mosqueSupport.form.sets')}</SelectItem>
                      <SelectItem value="50">50 {t('mosqueSupport.form.sets')}</SelectItem>
                      <SelectItem value="100">100 {t('mosqueSupport.form.sets')}</SelectItem>
                      <SelectItem value="100+">100+ {t('mosqueSupport.form.sets')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t('mosqueSupport.form.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder={t('mosqueSupport.form.notesPlaceholder')}
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? t('common.loading') : t('mosqueSupport.form.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Trust Note */}
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {t('mosqueSupport.trustNote')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MosqueSupport;
