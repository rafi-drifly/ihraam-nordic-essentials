import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageCircle, MapPin, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Form validation schema
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const validatedData = contactSchema.parse(formData);

      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: validatedData,
      });

      if (error) {
        throw new Error(error.message || 'Failed to send message');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: t('contact.form.success.title'),
        description: t('contact.form.success.description'),
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error: any) {
      console.error('Form submission error:', error);

      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);

        toast({
          title: t('contact.form.error.validation'),
          description: t('contact.form.error.validationDescription'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('contact.form.error.title'),
          description: error.message || "Please try again later or contact us directly.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
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
      title: t('contact.methods.email.title'),
      description: t('contact.methods.email.description'),
      contact: "support@pureihraam.com",
      action: "mailto:support@pureihraam.com"
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: t('contact.methods.whatsapp.title'),
      description: t('contact.methods.whatsapp.description'),
      contact: "+46720131476",
      action: "https://wa.me/46720131476"
    },
    {
      icon: <Phone className="h-6 w-6 text-primary" />,
      title: t('contact.methods.call.title'),
      description: t('contact.methods.call.description'),
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
            {t('contact.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">{t('contact.getInTouch')}</h2>

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
                  <span>{t('contact.hours.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('contact.hours.weekdays')}</span>
                    <span>{t('contact.hours.weekdaysTimes')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('contact.hours.saturday')}</span>
                    <span>{t('contact.hours.saturdayTimes')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('contact.hours.sunday')}</span>
                    <span>{t('contact.hours.sundayTimes')}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-3">
                    {t('contact.hours.timezone')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>{t('contact.serviceArea.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">{t('contact.serviceArea.primary')}</span> Sweden 🇸🇪</p>
                  <p><span className="font-medium">{t('contact.serviceArea.extended')}</span> Nordic Countries</p>
                  <p><span className="font-medium">{t('contact.serviceArea.international')}</span> European Union</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('contact.form.title')}</CardTitle>
                <p className="text-muted-foreground">
                  {t('contact.form.subtitle')}
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contact.form.name')} *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('contact.form.namePlaceholder')}
                        required
                        disabled={isSubmitting}
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contact.form.email')} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('contact.form.emailPlaceholder')}
                        required
                        disabled={isSubmitting}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t('contact.form.subject')} *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t('contact.form.subjectPlaceholder')}
                      required
                      disabled={isSubmitting}
                      className={errors.subject ? "border-red-500" : ""}
                    />
                    {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contact.form.message')} *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('contact.form.messagePlaceholder')}
                      className={`min-h-[120px] ${errors.message ? "border-red-500" : ""}`}
                      required
                      disabled={isSubmitting}
                    />
                    {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {t('contact.form.privacy')}
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
              <CardTitle>{t('contact.faq.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('contact.faq.size.question')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('contact.faq.size.answer')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('contact.faq.accessories.question')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('contact.faq.accessories.answer')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('contact.faq.bulk.question')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('contact.faq.bulk.answer')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('contact.faq.shipping.question')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('contact.faq.shipping.answer')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('contact.faq.included.question')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('contact.faq.included.answer')}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('contact.faq.returns.question')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('contact.faq.returns.answer')}
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
