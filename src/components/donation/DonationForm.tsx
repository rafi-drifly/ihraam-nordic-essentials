import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Lock, Building2, Globe, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DONATION_AMOUNTS = [5, 10, 25, 50];

interface DonationFormProps {
  localePrefix: string;
}

const DonationForm = ({ localePrefix }: DonationFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [direction, setDirection] = useState<'mosque' | 'needy' | 'where-needed'>('where-needed');
  const [anonymous, setAnonymous] = useState(false);
  const [wantsReceipt, setWantsReceipt] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState("");
  const [coverFees, setCoverFees] = useState(false);
  const [loading, setLoading] = useState(false);

  const getFinalAmount = (): number => {
    let base = isCustom && customAmount ? parseFloat(customAmount) : (selectedAmount || 0);
    if (isNaN(base)) base = 0;
    
    // If covering fees, add ~2.9% + €0.25
    if (coverFees && base > 0) {
      base = base + (base * 0.029) + 0.25;
    }
    
    return Math.round(base * 100) / 100;
  };

  const getBaseAmount = (): number => {
    let base = isCustom && customAmount ? parseFloat(customAmount) : (selectedAmount || 0);
    if (isNaN(base)) base = 0;
    return base;
  };

  const getFeeAmount = (): number => {
    const base = getBaseAmount();
    if (!coverFees || base <= 0) return 0;
    return Math.round((base * 0.029 + 0.25) * 100) / 100;
  };

  const handleAmountClick = (amount: number) => {
    setSelectedAmount(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    setSelectedAmount(null);
  };

  const handleDonate = async () => {
    const amount = getFinalAmount();
    if (amount < 1) {
      toast({
        title: t('common.error'),
        description: t('donation.minAmount'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-donation-checkout', {
        body: { 
          amount,
          frequency,
          direction,
          anonymous,
          wantsReceipt,
          receiptEmail: wantsReceipt ? receiptEmail : undefined,
          coverFees
        }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error('Error creating donation checkout:', error);
      toast({
        title: t('common.error'),
        description: "Failed to create donation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const directionInfo = {
    'mosque': 'Supports our Mosque Support Program — mosques receive Ihrams and keep proceeds for their needs.',
    'needy': 'Goes directly to verified humanitarian projects for those suffering worldwide.',
    'where-needed': 'We allocate where it\'s needed most based on current priorities.'
  };

  return (
    <section className="py-16 bg-background" id="donate-form">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">{t('donation.chooseAmount')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6 md:p-8">
            
            {/* Frequency Toggle */}
            <div className="flex rounded-lg bg-muted p-1">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  frequency === 'one-time' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setFrequency('one-time')}
              >
                One-Time
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  frequency === 'monthly' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setFrequency('monthly')}
              >
                Monthly
              </button>
            </div>

            {/* Amount Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {DONATION_AMOUNTS.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount && !isCustom ? "default" : "outline"}
                  size="lg"
                  className="h-14 text-lg"
                  onClick={() => handleAmountClick(amount)}
                >
                  €{amount}
                </Button>
              ))}
              <Button
                variant={isCustom ? "default" : "outline"}
                size="lg"
                className="h-14 text-lg"
                onClick={handleCustomClick}
              >
                {t('donation.amounts.custom')}
              </Button>
            </div>

            {isCustom && (
              <div className="flex items-center gap-2 max-w-xs mx-auto">
                <span className="text-lg font-medium">€</span>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={t('donation.amounts.customPlaceholder')}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="text-center text-lg"
                />
              </div>
            )}

            {/* Donation Direction */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Where should your donation go?</Label>
              <RadioGroup value={direction} onValueChange={(v) => setDirection(v as any)} className="space-y-3">
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="mosque" id="mosque" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="mosque" className="font-medium cursor-pointer flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      Mosque Support Program
                    </Label>
                    {direction === 'mosque' && (
                      <p className="text-xs text-muted-foreground mt-1">{directionInfo.mosque}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="needy" id="needy" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="needy" className="font-medium cursor-pointer flex items-center gap-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      Needy Projects
                    </Label>
                    {direction === 'needy' && (
                      <p className="text-xs text-muted-foreground mt-1">{directionInfo.needy}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="where-needed" id="where-needed" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="where-needed" className="font-medium cursor-pointer flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      Where Most Needed
                    </Label>
                    {direction === 'where-needed' && (
                      <p className="text-xs text-muted-foreground mt-1">{directionInfo['where-needed']}</p>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="anonymous" 
                  checked={anonymous}
                  onCheckedChange={(checked) => setAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                  Donate anonymously
                </Label>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="receipt" 
                  checked={wantsReceipt}
                  onCheckedChange={(checked) => setWantsReceipt(checked as boolean)}
                />
                <Label htmlFor="receipt" className="text-sm cursor-pointer">
                  Email me a receipt
                </Label>
              </div>

              {wantsReceipt && (
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={receiptEmail}
                  onChange={(e) => setReceiptEmail(e.target.value)}
                  className="max-w-xs"
                />
              )}

              <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                <Checkbox 
                  id="coverFees" 
                  checked={coverFees}
                  onCheckedChange={(checked) => setCoverFees(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="coverFees" className="text-sm cursor-pointer font-medium">
                    Cover Stripe fees so more reaches the mission
                  </Label>
                  {coverFees && getBaseAmount() > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      +€{getFeeAmount().toFixed(2)} to cover processing fees
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-primary hover:opacity-90 h-14 text-lg"
              onClick={handleDonate}
              disabled={loading || getFinalAmount() < 1}
            >
              <Lock className="h-5 w-5 mr-2" />
              {loading ? t('common.loading') : `Donate Securely – €${getFinalAmount().toFixed(2)}`}
              {frequency === 'monthly' && '/month'}
            </Button>

            {/* Microcopy */}
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Donations are voluntary. We do not pressure anyone to donate.
              </p>
              <p className="text-xs text-muted-foreground">
                Stripe may charge payment processing fees; we report these transparently.
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DonationForm;
