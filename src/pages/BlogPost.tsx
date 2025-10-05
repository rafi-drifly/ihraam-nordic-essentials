import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowLeft } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();

  // This would normally come from a database or CMS
  const post = {
    title: "How to Wear Ihram – A Simple Guide for Pilgrims",
    excerpt: "A step-by-step guide to properly wearing the Ihram garments, ensuring comfort and adherence to Sunnah during your sacred journey.",
    author: "Pure Ihram Team",
    readTime: "12 min read",
    date: "October 5, 2025",
    category: "Guide",
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/blog">
          <Button variant="ghost" className="mb-8 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">
            {post.category}
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {post.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              {post.author}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {post.readTime}
            </div>
            <span>{post.date}</span>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Embarking on the journey of Hajj or Umrah is one of the most spiritual experiences in a Muslim's life. Before stepping into Ihram, every pilgrim prepares physically and spiritually — purifying the body, making intention (niyyah), and adorning the two humble white garments that symbolize equality, humility, and devotion to Allah.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              In this guide, we'll walk you through everything you need to know about how to wear Ihram, its Islamic significance, and practical tips to stay comfortable throughout your pilgrimage.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What is Ihram?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              The word Ihram (إحرام) means "to make sacred" — it's both a spiritual state and the simple two-piece garment that marks the beginning of your pilgrimage.
            </p>
            
            <Card className="bg-accent/5 border-accent/20 mb-6">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground mb-2">
                  "And proclaim to the people the Hajj; they will come to you on foot and on every lean camel; they will come from every distant pass."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Qur'an 22:27</cite>
              </CardContent>
            </Card>

            <p className="text-muted-foreground leading-relaxed">
              When a pilgrim enters Ihram, they leave behind worldly distinctions — wealth, status, and pride — standing equal before Allah.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">What You'll Need</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Before wearing Ihram, make sure you have the following essentials:
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">1. Ihram Garment</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Two unstitched white cotton cloths:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>Izar (lower garment)</strong> – covers the waist down to the ankles.</li>
                  <li><strong>Rida' (upper garment)</strong> – covers from the shoulders to the waist.</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  At Pure Ihram, our cloth sets are made from lightweight, breathable cotton, pre-washed and ready for your sacred journey.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">2. Ihram Belt (Optional)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A belt or money pouch helps keep the izar secure and carry essentials like ID, money, and mobile.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">3. Comfortable Footwear</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sandals or slippers that leave the ankles and top of the foot uncovered (as per Sunnah).
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Step-by-Step: How to Wear Ihram (for Men)</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Step 1: Prepare for Ihram</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Before putting on Ihram, follow the Sunnah of preparation:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
                  <li>Take a full bath (ghusl) or at least perform wudu.</li>
                  <li>Trim nails, remove unwanted hair.</li>
                  <li>Apply non-scented oil or perfume to the body (not the Ihram cloth).</li>
                  <li>Wear Ihram garments after ghusl.</li>
                </ul>
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="p-4">
                    <p className="text-sm italic text-foreground">
                      The Prophet ﷺ would perform ghusl before entering Ihram and apply fragrance to his body.
                    </p>
                    <cite className="text-xs text-muted-foreground">— Sahih Muslim</cite>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Step 2: Wearing the Izar (Lower Garment)</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
                  <li>Wrap the izar around your waist.</li>
                  <li>Ensure it covers from your navel to your ankles.</li>
                  <li>Fold or tie it tightly enough so it won't slip during tawaf or sa'i.</li>
                  <li>Use a belt if needed for support.</li>
                </ul>
                <p className="text-sm bg-muted p-4 rounded-lg">
                  <strong>Tip:</strong> Keep the izar slightly loose to allow airflow — especially in hot climates.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Step 3: Wearing the Rida' (Upper Garment)</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Drape the rida' over your shoulders.</li>
                  <li>The cloth should cover both shoulders and upper arms.</li>
                  <li>For tawaf al-umrah, it's Sunnah to expose the right shoulder (idhtiba') — this means placing the rida' under your right arm and over the left shoulder during tawaf only.</li>
                  <li>After tawaf, return the rida' to cover both shoulders.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">Step 4: Make Your Intention (Niyyah)</h3>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Once you're ready and near the miqat (the station to enter Ihram), make your intention.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  <strong>"Labbayka Allahumma Hajjan"</strong> (Here I am, O Allah, intending Hajj)
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  or <strong>"Labbayka Allahumma Umrah"</strong> (Here I am, O Allah, intending Umrah)
                </p>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Then recite the Talbiyah aloud:
                </p>
                <Card className="bg-accent/5 border-accent/20">
                  <CardContent className="p-4">
                    <p className="text-foreground mb-2">
                      "Labbayk Allahumma Labbayk, Labbayka laa shareeka laka labbayk, Innal-hamda wan-ni'mata laka wal-mulk, laa shareeka lak."
                    </p>
                    <p className="text-sm text-muted-foreground italic">
                      (Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Indeed, all praise, blessings, and sovereignty belong to You. You have no partner.)
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ihram Guidelines for Women</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Women do not have a specific Ihram garment — they wear modest, simple, non-adorned clothing that covers the body completely (without gloves or face veil).
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Use a light scarf or shawl for comfort and ventilation.</li>
              <li>Avoid stitched or fitted garments designed for display.</li>
              <li>Focus on modesty and ease.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Common Mistakes to Avoid</h2>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li>❌ Wearing stitched clothing (for men).</li>
              <li>❌ Using scented soaps or perfumes on Ihram cloth.</li>
              <li>❌ Exposing body parts that should remain covered.</li>
              <li>❌ Forgetting to make niyyah before crossing miqat.</li>
              <li>❌ Wearing tight belts or accessories that resemble normal clothing.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Practical Tips for Comfort</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Choose lightweight cotton Ihram — especially if traveling in summer.</li>
              <li>Keep a spare Ihram set for long journeys or emergencies.</li>
              <li>Fold carefully after use and store in a clean bag.</li>
              <li>Stay hydrated and avoid overcrowded areas when possible.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Spiritual Reminder</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Ihram is not just about two white cloths — it's about purifying your heart and disconnecting from worldly distractions.
            </p>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground mb-2">
                  "Take provisions, but indeed, the best provision is Taqwa (God-consciousness)."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Qur'an 2:197</cite>
              </CardContent>
            </Card>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Closing Message</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At Pure Ihram, we believe Ihram should be simple, comfortable, and accessible to everyone. Our lightweight, pre-washed cotton Ihram sets are made with the intention of ease and reward — so you can focus on your worship, not discomfort.
            </p>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground mb-2">
                  "The most beloved of people to Allah are those who bring the most benefit to others."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Prophet Muhammad ﷺ (Al-Mu'jam al-Awsat)</cite>
              </CardContent>
            </Card>
          </section>
        </article>

        {/* CTA Section */}
        <Card className="bg-gradient-subtle border-0 mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready for Your Sacred Journey?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Order your premium Ihram cloth today and prepare for your pilgrimage with comfort and confidence.
            </p>
            <Link to="/shop">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Shop Ihram
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlogPost;
