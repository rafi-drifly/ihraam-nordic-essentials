import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const UmrahDuasBlog = () => {
  const { t, i18n } = useTranslation();
  const localePrefix = i18n.language === 'sv' ? '/sv' : '';

  return (
    <div className="min-h-screen py-8">
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
            <Badge variant="secondary">{t('blog.categories.guide')}</Badge>
            <span className="text-sm text-muted-foreground">{t('blog.posts.essentialDuas.readTime')}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            📖 {t('blog.posts.essentialDuas.title')}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {t('blog.posts.essentialDuas.excerpt')}
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
              Umrah is not just a physical journey to the holy lands of Makkah — it's a spiritual conversation with Allah.
            </p>
            <p className="text-foreground leading-relaxed">
              Each step of Umrah — from wearing Ihram to performing Tawaf — offers an opportunity to draw nearer through dua (supplication).
            </p>
            <p className="text-foreground leading-relaxed">
              This guide gathers the most important duas to memorize, recite, and reflect upon during your Umrah journey, 
              complete with Arabic, transliteration, and English meaning.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary mt-6">
              <blockquote className="text-base italic text-foreground mb-2">
                "And when My servants ask you concerning Me, indeed I am near. I respond to the call of the supplicant when he calls upon Me."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 2:186</cite>
            </div>
          </CardContent>
        </Card>

        {/* Dua 1 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🧳 1️⃣ Dua Before Leaving for Umrah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              When leaving home, entrust your journey to Allah.
            </p>
            
            <div className="space-y-3">
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Arabic:</p>
                <p className="text-2xl text-foreground text-right mb-4" dir="rtl">
                  بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ
                </p>
                
                <p className="text-sm font-semibold text-muted-foreground mb-2">Transliteration:</p>
                <p className="text-lg text-foreground italic mb-4">
                  Bismillāh, tawakkaltu ʿalallāh, wa lā ḥawla wa lā quwwata illā billāh
                </p>
                
                <p className="text-sm font-semibold text-muted-foreground mb-2">Meaning:</p>
                <p className="text-foreground">
                  "In the name of Allah, I place my trust in Allah. There is no power and no strength except with Allah."
                </p>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="flex items-start gap-2 text-sm text-foreground">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Tip:</strong> Recite this whenever you step out of your home — it invites divine protection throughout your travels.</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dua 2 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🕋 2️⃣ Dua When Wearing Ihram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Before or after wearing the Ihram, make your intention (niyyah) and say:
            </p>
            
            <div className="space-y-4">
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-semibold text-muted-foreground mb-2">For Umrah:</p>
                <p className="text-2xl text-foreground text-right mb-2" dir="rtl">
                  لَبَّيْكَ اللّهُمَّ عُمْرَةً
                </p>
                <p className="text-lg text-foreground italic mb-2">
                  Labbayka Allahumma ʿUmrah
                </p>
                <p className="text-foreground">
                  → "Here I am, O Allah, intending to perform Umrah."
                </p>
              </div>
              
              <p className="text-foreground font-semibold">Then recite the Talbiyah:</p>
              
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-2xl text-foreground text-right mb-4" dir="rtl">
                  لَبَّيْكَ اللّهُمَّ لَبَّيْك، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْك<br />
                  إِنَّ الْـحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْك، لَا شَرِيكَ لَكَ
                </p>
                
                <p className="text-lg text-foreground italic mb-4">
                  Labbayk Allahumma Labbayk, Labbayka la shareeka laka Labbayk.<br />
                  Innal-ḥamda wan-niʿmata laka wal-mulk, la shareeka lak.
                </p>
                
                <p className="text-sm font-semibold text-muted-foreground mb-2">Meaning:</p>
                <p className="text-foreground">
                  "Here I am, O Allah, here I am. You have no partner. Truly all praise, favor, and sovereignty belong to You. You have no partner."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dua 3 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🚶 3️⃣ Dua When Entering Makkah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              As you approach the sacred city, recite:
            </p>
            
            <div className="bg-accent/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Arabic:</p>
              <p className="text-2xl text-foreground text-right mb-4" dir="rtl">
                اللّٰهُمَّ هٰذَا حَرَمُكَ وَأَمْنُكَ، فَحَرِّمْ لَحْمِي وَدَمِي عَلَى النَّارِ، وَآمِنِّي مِنْ عَذَابِكَ يَوْمَ تَبْعَثُ عِبَادَكَ
              </p>
              
              <p className="text-sm font-semibold text-muted-foreground mb-2">Transliteration:</p>
              <p className="text-lg text-foreground italic mb-4">
                Allāhumma hādhā ḥaramuka wa amnuka, faḥarrim laḥmī wa damī ʿalan-nār, wa āminnī min ʿadhābika yawma tabʿathu ʿibādak.
              </p>
              
              <p className="text-sm font-semibold text-muted-foreground mb-2">Meaning:</p>
              <p className="text-foreground">
                "O Allah, this is Your sacred sanctuary and place of security. Protect my flesh and blood from the Fire 
                and grant me safety from Your punishment on the Day You resurrect Your servants."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dua 4 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🏠 4️⃣ Dua When Seeing the Kaaba for the First Time
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              This is one of the most emotional and powerful moments of your life — make heartfelt dua.
            </p>
            
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">Recommended Dua:</p>
              
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-2xl text-foreground text-right mb-4" dir="rtl">
                  اللّٰهُمَّ زِدْ هٰذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَمَهَابَةً وَبِرًّا، وَزِدْ مَنْ شَرَّفَهُ وَكَرَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَعْظِيمًا وَمَهَابَةً وَبِرًّا
                </p>
                
                <p className="text-lg text-foreground italic mb-4">
                  Allāhumma zid hādhā al-bayta tashrīfan wa taʿẓīman wa mahābatan wa birran,<br />
                  wa zid man sharrafahu wa karramahu mimman ḥajjahu awiʿtamrahu tashrīfan wa taʿẓīman wa mahābatan wa birran.
                </p>
                
                <p className="text-sm font-semibold text-muted-foreground mb-2">Meaning:</p>
                <p className="text-foreground">
                  "O Allah, increase this House in honor, greatness, respect, and reverence, and increase those who honor 
                  and visit it in the same."
                </p>
              </div>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="flex items-start gap-2 text-sm text-foreground">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span><strong>Tip:</strong> You may also make personal dua — for forgiveness, family, and acceptance — as all supplications here are answered, insha'Allah.</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dua 5 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🔄 5️⃣ Dua During Tawaf
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              There is no fixed dua — you can recite Qur'an, dhikr, or any personal supplication.
            </p>
            <p className="text-foreground leading-relaxed">
              However, between the Yemeni Corner (Rukn al-Yamani) and the Black Stone (Hajar al-Aswad), recite this Sunnah dua:
            </p>
            
            <div className="bg-accent/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Arabic:</p>
              <p className="text-2xl text-foreground text-right mb-4" dir="rtl">
                رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً، وَفِي الآخِرَةِ حَسَنَةً، وَقِنَا عَذَابَ النَّارِ
              </p>
              
              <p className="text-sm font-semibold text-muted-foreground mb-2">Transliteration:</p>
              <p className="text-lg text-foreground italic mb-4">
                Rabbana ātinā fid-dunyā ḥasanah, wa fil-ākhirati ḥasanah, wa qinā ʿadhāban-nār
              </p>
              
              <p className="text-sm font-semibold text-muted-foreground mb-2">Meaning:</p>
              <p className="text-foreground">
                "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dua 6 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🏃‍♂️ 6️⃣ Dua During Sa'i (Between Safa and Marwah)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              When climbing Safa for the first time, face the Kaaba and say:
            </p>
            
            <div className="space-y-4">
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Arabic:</p>
                <p className="text-2xl text-foreground text-right mb-4" dir="rtl">
                  إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ<br />
                  أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ
                </p>
                
                <p className="text-lg text-foreground italic">
                  Inna aṣ-ṣafā wal-marwata min shaʿā'irillāh, abda'u bimā bad'a Allāhu bih
                </p>
              </div>
              
              <p className="text-foreground">Then recite three times (raising your hands):</p>
              
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-sm font-semibold text-muted-foreground mb-2">Arabic:</p>
                <p className="text-2xl text-foreground text-right mb-4" dir="rtl">
                  اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ<br />
                  لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ<br />
                  لَا إِلٰهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ
                </p>
                
                <p className="text-lg text-foreground italic mb-4">
                  Allāhu Akbar (x3)... Lā ilāha illallāhu waḥdahu lā sharīka lah...
                </p>
                
                <p className="text-sm font-semibold text-muted-foreground mb-2">Meaning:</p>
                <p className="text-foreground">
                  "There is no god but Allah alone, without partner. His is the dominion and praise, and He has power over all things. 
                  There is no god but Allah alone. He fulfilled His promise, helped His servant, and defeated the confederates alone."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dua 7 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              ✂️ 7️⃣ Dua After Completing Umrah
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              After finishing your rituals and trimming/cutting hair, thank Allah for allowing you this honor.
            </p>
            
            <div className="bg-accent/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-muted-foreground mb-2">Arabic:</p>
              <p className="text-2xl text-foreground text-right mb-4" dir="rtl">
                اللّٰهُمَّ تَقَبَّلْ مِنَّا وَاغْفِرْ لَنَا
              </p>
              
              <p className="text-sm font-semibold text-muted-foreground mb-2">Transliteration:</p>
              <p className="text-lg text-foreground italic mb-4">
                Allāhumma taqabbal minnā wa ghfir lanā
              </p>
              
              <p className="text-sm font-semibold text-muted-foreground mb-2">Meaning:</p>
              <p className="text-foreground">
                "O Allah, accept (this Umrah) from us and forgive us."
              </p>
            </div>
            
            <p className="text-foreground">
              💖 Reflect on Allah's mercy and remember those who asked you for dua.
            </p>
          </CardContent>
        </Card>

        {/* Dua 8 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🌸 8️⃣ Recommended Duas Throughout the Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-semibold text-foreground mb-3">For Forgiveness:</p>
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-lg text-foreground italic mb-2">
                  Astaghfirullāha rabbī min kulli dhanbin wa atūbu ilayh
                </p>
                <p className="text-muted-foreground">
                  "I seek Allah's forgiveness, my Lord, for every sin and I repent to Him."
                </p>
              </div>
            </div>
            
            <div>
              <p className="font-semibold text-foreground mb-3">For Protection:</p>
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-lg text-foreground italic mb-2">
                  Allāhumma innī aʿūdhu bika min al-hammi wal-ḥuzn
                </p>
                <p className="text-muted-foreground">
                  "O Allah, I seek refuge in You from worry and grief."
                </p>
              </div>
            </div>
            
            <div>
              <p className="font-semibold text-foreground mb-3">For Guidance:</p>
              <div className="bg-accent/10 rounded-lg p-4">
                <p className="text-lg text-foreground italic mb-2">
                  Allāhumma ihdinī wa saddidnī
                </p>
                <p className="text-muted-foreground">
                  "O Allah, guide me and keep me on the right path."
                </p>
              </div>
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
              These duas are not mere rituals — they are conversations with Allah.
            </p>
            <p className="text-foreground leading-relaxed">
              Every word brings you closer to Him, and every supplication is an opportunity to be forgiven, uplifted, and renewed.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary mt-4">
              <blockquote className="text-base italic text-foreground mb-2">
                "Call upon Me; I will respond to you."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 40:60</cite>
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
                <Link to={`${localePrefix}/blog/common-mistakes-ihram`} className="text-primary hover:underline">
                  {t('blogPost.mistakesLink')} →
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

export default UmrahDuasBlog;