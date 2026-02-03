import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, X } from "lucide-react";

const DONATION_AMOUNTS = [2, 5, 10];

interface DonationSectionProps {
  selectedDonation: number;
  onDonationChange: (amount: number) => void;
}

const DonationSection = ({ selectedDonation, onDonationChange }: DonationSectionProps) => {
  const { t } = useTranslation();
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const handleAmountClick = (amount: number) => {
    setIsCustom(false);
    setCustomAmount("");
    onDonationChange(amount);
  };

  const handleCustomClick = () => {
    setIsCustom(true);
    onDonationChange(0);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const parsed = parseFloat(value);
    onDonationChange(isNaN(parsed) ? 0 : parsed);
  };

  const handleRemove = () => {
    setIsCustom(false);
    setCustomAmount("");
    onDonationChange(0);
  };

  const isSelected = (amount: number) => !isCustom && selectedDonation === amount;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          {t('donation.checkout.title')}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('donation.checkout.subtitle')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {DONATION_AMOUNTS.map((amount) => (
            <Button
              key={amount}
              variant={isSelected(amount) ? "default" : "outline"}
              size="sm"
              className="h-10"
              onClick={() => handleAmountClick(amount)}
            >
              €{amount}
            </Button>
          ))}
          <Button
            variant={isCustom ? "default" : "outline"}
            size="sm"
            className="h-10"
            onClick={handleCustomClick}
          >
            {t('donation.amounts.custom')}
          </Button>
        </div>

        {isCustom && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">€</span>
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder={t('donation.amounts.customPlaceholder')}
              value={customAmount}
              onChange={(e) => handleCustomAmountChange(e.target.value)}
              className="text-sm"
            />
          </div>
        )}

        {selectedDonation > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-1" />
            {t('donation.checkout.remove')}
          </Button>
        )}

        {selectedDonation > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {t('donation.checkout.thankYou', { amount: selectedDonation.toFixed(2) })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DonationSection;
