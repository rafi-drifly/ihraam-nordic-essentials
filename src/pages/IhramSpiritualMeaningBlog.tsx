import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const IhramSpiritualMeaningBlog = () => {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/blog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guides
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">Spiritual</Badge>
            <span className="text-sm text-muted-foreground">10 min read</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            🌿 The Spiritual Meaning of Ihram – Equality Before Allah
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Exploring the deeper significance of Ihram and how it symbolizes humility, purity, and unity in Islam.
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-8 bg-accent/5 border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🌙</span> Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Before every pilgrim begins the sacred journey of Hajj or Umrah, there is a powerful transformation — 
              from individual identity to collective humility.
            </p>
            <p className="text-foreground leading-relaxed">
              This transformation begins the moment one wears Ihram, the simple white garment that erases worldly 
              differences and reminds us of our shared humanity before Allah.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary mt-6">
              <blockquote className="text-base italic text-foreground mb-2">
                "O mankind! We have created you from a male and a female and made you into nations and tribes so that 
                you may know one another. Verily, the most noble of you in the sight of Allah is the most righteous of you."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 49:13</cite>
            </div>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🕋 1️⃣ The Essence of Ihram – A Garment of the Soul
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              "Ihram" literally means <em>to make sacred</em>.
            </p>
            <p className="text-foreground leading-relaxed">
              It is not merely clothing — it's a state of purity and devotion that envelops both body and spirit.
            </p>
            <p className="text-foreground leading-relaxed">
              When you put on Ihram, you leave behind your status, wealth, and nationality. You stand before Allah 
              just as you were born — equal, humble, and dependent on His mercy.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-foreground italic">
                It's a declaration that says:
              </p>
              <p className="text-foreground font-semibold mt-2">
                "O Allah, I come to You with nothing but my faith."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🤍 2️⃣ Symbol of Equality and Unity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              No matter where you come from — a king or a laborer, a scholar or a student — in Ihram, you are all the same.
            </p>
            <p className="text-foreground leading-relaxed">
              The white unstitched garments worn by men and the modest attire worn by women erase every sign of 
              hierarchy or vanity.
            </p>
            <p className="text-foreground leading-relaxed">
              In that crowd of millions circling the Kaabah, no one can distinguish race, rank, or class.
            </p>
            <p className="text-foreground font-semibold">
              This is the true spirit of Islam — equality in servitude.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary mt-4">
              <blockquote className="text-base italic text-foreground mb-2">
                "Indeed, the believers are brothers."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 49:10</cite>
            </div>
            <div className="bg-accent/10 rounded-lg p-4 mt-4">
              <p className="text-foreground">
                <strong>💡 Reflection:</strong><br />
                Ihram is not only a physical garment — it's a mirror that reflects the purity of your heart and 
                the equality of all souls before Allah.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🌤 3️⃣ The Reminder of Death and the Hereafter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Ihram also reminds us of our final journey — the moment we are wrapped in a white shroud (kafan) 
              and return to our Creator.
            </p>
            <p className="text-foreground leading-relaxed">
              The simplicity of Ihram strips us from attachment to this world, preparing our hearts for the 
              eternal life to come.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary">
              <blockquote className="text-base italic text-foreground mb-2">
                "Every soul shall taste death. And you will only be given your full reward on the Day of Resurrection."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 3:185</cite>
            </div>
            <div className="bg-accent/10 rounded-lg p-4">
              <p className="text-foreground">
                <strong>💭 When a pilgrim wears Ihram, he silently acknowledges:</strong><br />
                "I may not return from this journey — let me go pure, forgiven, and free of sin."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              💬 4️⃣ Ihram as a State of Mind
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              While Ihram begins with two white cloths, its true meaning lies within the heart.
            </p>
            <p className="text-foreground leading-relaxed">
              It's about entering a state of spiritual discipline, where anger, vanity, and argument are left behind.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary">
              <blockquote className="text-base italic text-foreground mb-2">
                "So whoever has made Hajj obligatory upon himself, there is to be for him no sexual relations, 
                no disobedience, and no disputing during Hajj."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 2:197</cite>
            </div>
            <p className="text-foreground leading-relaxed">
              Ihram teaches patience, forgiveness, and inner calm — values that every believer should carry long 
              after Hajj or Umrah ends.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                True Ihram is when:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Your tongue avoids argument</li>
                <li>Your eyes avoid sin</li>
                <li>Your heart avoids pride</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🪶 5️⃣ Ihram as a Symbol of Brotherhood and Peace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              In Ihram, pilgrims stand shoulder to shoulder — white garments flowing in harmony, voices united in Talbiyah:
            </p>
            <div className="bg-accent/10 rounded-lg p-4 text-center">
              <p className="text-xl text-foreground italic">
                "Labbayk Allahumma Labbayk..."
              </p>
            </div>
            <p className="text-foreground leading-relaxed">
              That sound — millions chanting the same words — is a manifestation of the Ummah's unity.
            </p>
            <p className="text-foreground leading-relaxed">
              Ihram eliminates all barriers, reminding us that every believer belongs to one family, under one Creator.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary">
              <blockquote className="text-base italic text-foreground mb-2">
                "This Ummah of yours is one Ummah, and I am your Lord, so worship Me."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 21:92</cite>
            </div>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              🕯 6️⃣ The Purity of Intention (Ikhlas)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Ihram purifies intention.
            </p>
            <p className="text-foreground leading-relaxed">
              When you enter Ihram, you declare that your journey is for Allah alone, not for photos, titles, or pride.
            </p>
            <p className="text-foreground leading-relaxed">
              It trains the heart to say:
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary">
              <blockquote className="text-base italic text-foreground mb-2">
                "My Salah, my sacrifice, my life, and my death are all for Allah, Lord of the worlds."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 6:162</cite>
            </div>
            <p className="text-foreground leading-relaxed">
              This sincerity — <em>Ikhlas</em> — is the essence of all worship, and Ihram is its outer expression.
            </p>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">
              💖 7️⃣ Returning Renewed and Reborn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              When a pilgrim removes Ihram after completing the rites, it's not just a change of clothes — it's a rebirth.
            </p>
            <p className="text-foreground leading-relaxed">
              He returns purified, lighter, and filled with spiritual clarity.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary">
              <blockquote className="text-base italic text-foreground mb-2">
                "Whoever performs Hajj and does not commit sin or dispute, returns as pure as the day he was born."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Sahih al-Bukhari</cite>
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Reflection */}
        <Card className="mb-8 bg-gradient-subtle border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>💭</span> Spiritual Reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              Ihram is the fabric of humility, woven with patience and faith.
            </p>
            <p className="text-foreground leading-relaxed">
              It teaches that before Allah, we are all equal, temporary, and dependent on His mercy.
            </p>
            <p className="text-foreground leading-relaxed font-semibold">
              Through Ihram, the pilgrim doesn't just wear purity — he becomes purity.
            </p>
            <div className="bg-background rounded-lg p-6 border-l-4 border-primary mt-4">
              <blockquote className="text-base italic text-foreground mb-2">
                "And whosoever honors the symbols of Allah — indeed, it is from the piety of hearts."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 22:32</cite>
            </div>
          </CardContent>
        </Card>

        {/* Related Reading */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏷️ Related Reading</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Link to="/blog/how-to-wear-ihram" className="text-primary hover:underline">
                  How to Wear Ihram – Step-by-Step Guide →
                </Link>
              </li>
              <li>
                <Link to="/blog/sunnah-acts-before-ihram" className="text-primary hover:underline">
                  Sunnah Acts Before Entering Ihram →
                </Link>
              </li>
              <li>
                <Link to="/blog/umrah-preparation-checklist" className="text-primary hover:underline">
                  Checklist for Umrah Preparation →
                </Link>
              </li>
              <li>
                <Link to="/blog/essential-duas-umrah" className="text-primary hover:underline">
                  Essential Duas for Umrah →
                </Link>
              </li>
              <li>
                <Link to="/blog/common-mistakes-ihram" className="text-primary hover:underline">
                  Common Mistakes Pilgrims Make in Ihram →
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Back to Blog */}
        <div className="text-center">
          <Link to="/blog">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Guides
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IhramSpiritualMeaningBlog;