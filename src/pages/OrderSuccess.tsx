import { useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, ArrowRight, Mail } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { trackPurchase } from "@/lib/analytics";
import { takePendingOrder } from "@/lib/pendingOrder";
import SEOHead from "@/components/SEOHead";



const PaymentSuccess = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const reportedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    // One report per Stripe session, even if this effect runs again (remount,
    // StrictMode double-invoke, or a future dependency regaining instability).
    if (reportedSessionRef.current === sessionId) return;
    reportedSessionRef.current = sessionId;

    // Totals were stashed when checkout started; the basket itself is gone by
    // the time Stripe sends the customer back here.
    const pending = takePendingOrder();
    trackPurchase({
      order_id: sessionId,
      total: pending?.total,
      item_count: pending?.item_count,
      currency: pending?.currency,
      payment_method: 'stripe',
    });

    clearCart();
  }, [sessionId, clearCart]);

  return (
    <div className="py-8">
      <SEOHead title={t('orderSuccess.seoTitle')} description="Your order confirmation." noindex />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('orderSuccess.heading')}</h1>
          <p className="text-lg text-muted-foreground">
            {t('orderSuccess.subheading')}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('orderSuccess.cardTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-accent-foreground mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-accent-foreground mb-2">{t('orderSuccess.emailTitle')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('orderSuccess.emailBody')}{" "}
                    <Link to="/guest-order-lookup" className="text-primary hover:underline">
                      /guest-order-lookup
                    </Link>.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>{t('orderSuccess.nextTitle')}</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>- {t('orderSuccess.next1')}</li>
                <li>- {t('orderSuccess.next2')}</li>
                <li>- {t('orderSuccess.next3')}</li>
                <li>- {t('orderSuccess.next4')}</li>
              </ul>
            </div>

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h3 className="font-semibold text-accent-foreground mb-2">{t('orderSuccess.timelineTitle')}</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>{t('orderSuccess.timelineSweden')}</span>
                  <span>{t('orderSuccess.timelineSwedenDays')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('orderSuccess.timelineEu')}</span>
                  <span>{t('orderSuccess.timelineEuDays')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            {t('orderSuccess.blessing')}
          </p>

          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link to="/shop">{t('orderSuccess.continueShopping')}</Link>
            </Button>
            <Button asChild className="bg-gradient-primary hover:opacity-90">
              <Link to="/">
                <ArrowRight className="h-4 w-4 mr-2" />
                {t('orderSuccess.backHome')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">{t('orderSuccess.helpTitle')}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('orderSuccess.helpBody')}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/contact">{t('orderSuccess.contactSupport')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
