import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import SEOHead from "@/components/SEOHead";

const IhramMistakesBlog = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === 'sv' ? '/sv' : i18n.language === 'no' ? '/no' : '';

  return (
    <div className="min-h-screen py-8">
      <SEOHead 
        title="Common Mistakes Pilgrims Make in Ihram | Pure Ihram"
        description="Avoid these 10 common Ihram mistakes during Hajj and Umrah. Learn what's prohibited, how to stay compliant, and tips for a spiritually rewarding pilgrimage."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to={`${localePrefix}/blog`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('blogPost.backToGuides')}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">{t('blog.categories.tips')}</Badge>
            <span className="text-sm text-muted-foreground">{t('blog.posts.commonMistakes.readTime')}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            ⚠️ {t('blog.posts.commonMistakes.title')}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('blog.posts.commonMistakes.excerpt')}
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 bg-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🌙</span> {t('blogPost.introduction')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Entering the state of Ihram is one of the most sacred acts of worship in Hajj and Umrah. 
              It marks the pilgrim's full surrender — leaving behind worldly distinctions and standing equal before Allah.
            </p>
            <p className="text-foreground leading-relaxed">
              However, many pilgrims unknowingly commit small errors that can reduce the reward or even 
              invalidate parts of their pilgrimage.
            </p>
            <p className="text-foreground leading-relaxed">
              This guide highlights the most common mistakes people make during Ihram and offers tips on 
              how to avoid them — so your journey remains pure, peaceful, and accepted, insha'Allah.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary mt-6">
              <blockquote className="text-base italic text-foreground mb-2">
                "Take provisions, but indeed, the best provision is Taqwa (God-consciousness)."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 2:197</cite>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 1 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🧼 1️⃣ Using Scented Products After Entering Ihram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Once you've made your niyyah (intention) and entered Ihram, using any product with fragrance 
              becomes prohibited — including perfume, deodorant, soap, lotion, or wet wipes with scent.
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Common examples of mistakes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Using regular hand soap in airport bathrooms</li>
                <li>Spraying perfume before Tawaf</li>
                <li>Using scented moisturizers or sanitizer</li>
              </ul>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <p className="text-muted-foreground">
                Use unscented toiletries only. Carry a small Ihram kit with fragrance-free soap, wipes, lotion, and deodorant.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 2 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              ✂️ 2️⃣ Cutting Hair or Nails During Ihram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Trimming nails, shaving, or cutting hair while in Ihram is not allowed. This rule applies from 
              the moment you declare Ihram until after completing Umrah (or until the sacrifice on Hajj).
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Common mistakes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Clipping nails to "tidy up" before Tawaf</li>
                <li>Shaving after Tawaf but before Sa'i</li>
              </ul>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <p className="text-muted-foreground">
                Do all grooming before you enter Ihram. Once you've finished Sa'i, men should shave or 
                shorten their hair as part of completing Umrah.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 3 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              👕 3️⃣ Wearing Stitched or Fitted Clothing (For Men)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Men's Ihram must consist of two unstitched white garments — one for the lower body (Izar) 
              and one for the upper body (Rida').
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Yet some men mistakenly wear:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>T-shirts under the Rida'</li>
                <li>Elastic or stitched underwear</li>
                <li>Fitted shorts or pants</li>
              </ul>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <p className="text-muted-foreground mb-2">
                Stick strictly to two simple unstitched pieces. Use a belt or clip if needed, but avoid stitched underlayers.
              </p>
              <div className="bg-accent/10 rounded-lg p-3 mt-3">
                <p className="text-sm text-foreground">
                  💡 <strong>Tip:</strong> Pure Ihram's lightweight microfiber set (115×230 cm) stays secure 
                  and comfortable without overheating.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 4 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🧢 4️⃣ Covering the Head (Men)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Men in Ihram should not cover their heads with hats, scarves, or cloth — this is a direct 
              violation of Ihram rules.
            </p>
            <p className="text-muted-foreground">
              It's fine, however, to sit under a shade, umbrella, or bus roof.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Avoid caps, shawls, or blankets on the head</li>
                <li>Use shade only for protection, not as covering</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 5 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🧕 5️⃣ Covering the Face (Women)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Many women believe they must cover their faces at all times, but during Ihram, covering the 
              face or wearing gloves is not allowed.
            </p>
            <div className="bg-background rounded-lg p-4 border-l-4 border-primary">
              <p className="text-foreground mb-2">The Prophet ﷺ said:</p>
              <blockquote className="text-muted-foreground italic">
                "A woman in Ihram must not cover her face or wear gloves."
              </blockquote>
              <cite className="text-sm text-muted-foreground mt-2 block">— Sahih al-Bukhari</cite>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <p className="text-muted-foreground">
                Lower your hijab or niqab loosely from above without letting it touch your face directly 
                if you wish to maintain modesty.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 6 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              💬 6️⃣ Arguing, Complaining, or Losing Patience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Ihram is not only about clothing — it's about purifying character.
            </p>
            <p className="text-muted-foreground">
              Many pilgrims forget that arguing, gossiping, or showing frustration contradicts the spirit of Ihram.
            </p>
            <div className="bg-background rounded-lg p-4 border-l-4 border-primary">
              <blockquote className="text-foreground italic">
                "So whoever has made Hajj obligatory upon himself, there is [to be for him] no sexual relations, 
                no disobedience, and no disputing during Hajj."
              </blockquote>
              <cite className="text-sm text-muted-foreground mt-2 block">— Qur'an 2:197</cite>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <p className="text-muted-foreground">
                Stay calm, smile often, and remember — every delay, heatwave, or crowd is part of your test.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 7 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              ❤️ 7️⃣ Being Careless With the Talbiyah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              The Talbiyah ("Labbayk Allahumma Labbayk...") is a continuous remembrance during Ihram, 
              but some pilgrims only say it once and forget.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <p className="text-muted-foreground mb-2">
                Repeat the Talbiyah regularly — after prayers, when walking, or boarding vehicles — until you begin Tawaf.
              </p>
              <p className="text-muted-foreground">
                Keep your heart alive with it.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 8 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🪶 8️⃣ Wearing Ihram Incorrectly
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Many first-time pilgrims wrap the Ihram too loosely or too tightly.
            </p>
            <p className="text-muted-foreground">
              Some expose the shoulders unnecessarily or fail to secure the lower cloth properly.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-3">
                <li>Wrap from waist to ankle for full coverage</li>
                <li>Secure with a belt or clip</li>
                <li>Keep both shoulders covered except during Tawaf (when the right shoulder is uncovered)</li>
              </ul>
              <p className="text-sm text-foreground">
                👉 Read detailed steps here: <Link to={`${localePrefix}/blog/how-to-wear-ihram`} className="text-primary hover:underline">{t('blogPost.howToWearLink')}</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 9 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🕊️ 9️⃣ Forgetting to Make Intention at the Miqat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Declaring Ihram after passing the miqat is a serious mistake that requires a sacrifice (dam) for correction.
            </p>
            <p className="text-muted-foreground">
              Many travelers forget or delay it due to confusion on the plane or bus.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Know your miqat beforehand</li>
                <li>When the pilot announces "approaching miqat," make your intention and recite the Talbiyah immediately</li>
                <li>Stay ready in Ihram garments before reaching that point</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Mistake 10 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              📵 🔟 Treating Ihram Casually
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Some pilgrims treat Ihram like a uniform — chatting loudly, scrolling on phones, or joking excessively.
            </p>
            <p className="text-muted-foreground">
              Remember, you are standing before Allah, and this time is sacred.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                What to do instead:
              </p>
              <p className="text-muted-foreground mb-2">
                Maintain khushu' (focus) — use the time for dhikr, Qur'an, and reflection.
              </p>
              <p className="text-muted-foreground">
                Remind yourself that these moments may never return.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Reflection */}
        <Card className="mb-8 bg-gradient-subtle border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💭</span> {t('blogPost.spiritualReflection')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Mistakes happen, but what matters is sincerity and intention.
            </p>
            <p className="text-foreground leading-relaxed">
              If you make an error during Ihram, seek knowledge, ask a scholar, and know that Allah is Most Merciful.
            </p>
            <p className="text-foreground leading-relaxed">
              Your pilgrimage is about growth, not perfection.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary mt-4">
              <blockquote className="text-base italic text-foreground mb-2">
                "Whoever performs Hajj for the sake of Allah and does not commit obscene or sinful acts, 
                he will return like the day his mother gave birth to him."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Sahih al-Bukhari</cite>
            </div>
          </CardContent>
        </Card>

        {/* Related Reading */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏷️ {t('blogPost.relatedReading')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Link to={`${localePrefix}/blog/how-to-wear-ihram`} className="text-primary hover:underline">
                  {t('blogPost.howToWearLink')} →
                </Link>
              </li>
              <li>
                <Link to={`${localePrefix}/blog/sunnah-acts-before-ihram`} className="text-primary hover:underline">
                  {t('blogPost.sunnahActsLink')} →
                </Link>
              </li>
              <li>
                <Link to={`${localePrefix}/blog/umrah-preparation-checklist`} className="text-primary hover:underline">
                  {t('blogPost.checklistLink')} →
                </Link>
              </li>
              <li>
                <Link to={`${localePrefix}/blog/essential-duas-umrah`} className="text-primary hover:underline">
                  {t('blogPost.duasLink')} →
                </Link>
              </li>
              <li>
                <Link to={`${localePrefix}/blog/spiritual-meaning-ihram`} className="text-primary hover:underline">
                  {t('blogPost.spiritualMeaningLink')} →
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Back to Blog */}
        <div className="text-center">
          <Link to={`${localePrefix}/blog`}>
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('blogPost.backToAllGuides')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IhramMistakesBlog;