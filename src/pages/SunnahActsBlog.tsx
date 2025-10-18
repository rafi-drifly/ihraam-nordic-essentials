import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowLeft, ShoppingCart } from "lucide-react";

const SunnahActsBlog = () => {
  const post = {
    title: "Sunnah Acts Before Entering Ihram",
    excerpt: "Preparing your body and heart before stepping into the sacred state of Ihram.",
    author: "Islamic Scholar",
    readTime: "12 min read",
    date: "March 10, 2024",
    category: "Sunnah",
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
          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Every sacred journey begins with preparation — not only of luggage and documents, but of the heart and soul. Before donning the white garments of Ihram, the Prophet ﷺ taught us a series of Sunnah acts that purify the body, refine intention, and welcome the pilgrim into a state of humility and devotion.
            </p>
            
            <Card className="bg-accent/5 border-accent/20 mb-6">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground mb-2">
                  "And proclaim to the people the Hajj; they will come to you on foot and on every lean camel; they will come from every distant pass."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Qur'an 22:27</cite>
              </CardContent>
            </Card>
          </section>

          {/* Section 1: Performing Ghusl */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              1️⃣ Performing Ghusl (Full Ritual Bath)
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              One of the first Sunnah acts is to cleanse oneself thoroughly before wearing Ihram.
            </p>
            
            <Card className="bg-accent/5 border-l-4 mb-6" style={{ borderLeftColor: '#2C7A7B' }}>
              <CardContent className="p-6">
                <p className="text-foreground mb-2">
                  Ibn ʿUmar رضي الله عنهما said:
                </p>
                <blockquote className="text-base italic text-foreground mb-2">
                  "When the Messenger of Allah ﷺ intended to enter Ihram, he performed ghusl."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Sahih Muslim</cite>
              </CardContent>
            </Card>

            <div className="bg-muted p-6 rounded-lg mb-4">
              <h3 className="text-xl font-semibold text-foreground mb-3">Instructions:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Take a full ritual bath with the intention (niyyah) of purifying for Ihram.</li>
                <li>Use unscented soap or plain water.</li>
                <li>Avoid perfume on the cloth itself.</li>
              </ul>
            </div>

            <p className="text-muted-foreground leading-relaxed italic">
              <strong>Reflection:</strong> Ghusl symbolizes washing away worldly distractions and beginning your journey in purity before Allah.
            </p>
          </section>

          {/* Section 2: Trimming Nails & Removing Hair */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              2️⃣ Trimming Nails & Removing Unwanted Hair
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Before Ihram, it is Sunnah to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-4">
              <li>Trim nails (hands and feet)</li>
              <li>Shave underarms and pubic hair</li>
              <li>Trim moustache (for men)</li>
            </ul>

            <Card className="bg-accent/5 border-l-4 mb-6" style={{ borderLeftColor: '#2C7A7B' }}>
              <CardContent className="p-6">
                <blockquote className="text-base italic text-foreground mb-2">
                  "The fitrah consists of five things: circumcision, shaving the pubic hair, trimming the moustache, cutting the nails, and plucking the underarm hair."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Sahih al-Bukhari</cite>
              </CardContent>
            </Card>

            <p className="text-muted-foreground leading-relaxed italic">
              <strong>Purpose:</strong> Ensures cleanliness and avoids needing grooming during Ihram.
            </p>
          </section>

          {/* Section 3: Applying Perfume */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              3️⃣ Applying Perfume (Before Ihram Only)
            </h2>
            
            <Card className="bg-accent/5 border-l-4 mb-6" style={{ borderLeftColor: '#2C7A7B' }}>
              <CardContent className="p-6">
                <p className="text-foreground mb-2">
                  Aishah رضي الله عنها said:
                </p>
                <blockquote className="text-base italic text-foreground mb-2">
                  "I used to apply perfume to the Messenger of Allah ﷺ before he entered Ihram, and again when he exited Ihram."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Sahih al-Bukhari</cite>
              </CardContent>
            </Card>

            <div className="bg-muted p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-foreground mb-3">Guidelines:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Apply perfume to the body, not the Ihram cloth.</li>
                <li>The scent may remain after Ihram begins, as long as applied beforehand.</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Wearing Ihram */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              4️⃣ Wearing the Ihram Garments
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              After ghusl and grooming, wear your Ihram garments:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-6">
              <li><strong>Men:</strong> Two unstitched white pieces — Izar (lower) and Rida' (upper).</li>
              <li><strong>Women:</strong> Modest, simple clothing covering the body without adornment.</li>
            </ul>

            <Card className="bg-gradient-subtle border-0">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-foreground font-semibold mb-1">
                    For comfort and durability
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Choose the Pure Ihram Quick-Dry Set (115×230 cm)
                  </p>
                </div>
                <Link to="/shop">
                  <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          {/* Section 5: Praying Two Rak'ahs */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              5️⃣ Praying Two Rak'ahs (Optional Sunnah)
            </h2>
            
            <Card className="bg-accent/5 border-l-4 mb-6" style={{ borderLeftColor: '#2C7A7B' }}>
              <CardContent className="p-6">
                <blockquote className="text-base italic text-foreground mb-2">
                  "The Prophet ﷺ entered Ihram after praying two rak'ahs at Dhul-Hulaifah."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Reported by al-Bayhaqi</cite>
              </CardContent>
            </Card>

            <p className="text-muted-foreground leading-relaxed">
              If time permits, pray two rak'ahs before entering Ihram — a moment to purify intention and ask Allah for sincerity and acceptance.
            </p>
          </section>

          {/* Section 6: Niyyah & Talbiyah */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              6️⃣ Making Intention (Niyyah) & Talbiyah
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At the miqat, make your intention aloud:
            </p>

            <div className="bg-accent/10 p-6 rounded-lg mb-6">
              <p className="text-foreground mb-2">
                <strong>For Umrah:</strong> "Labbayka Allahumma Umrah."
              </p>
              <p className="text-foreground">
                <strong>For Hajj:</strong> "Labbayka Allahumma Hajjan."
              </p>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4">
              Then recite the <strong>Talbiyah</strong>:
            </p>

            <Card className="bg-accent/5 border-l-4" style={{ borderLeftColor: '#2C7A7B' }}>
              <CardContent className="p-6">
                <p className="text-foreground mb-3 text-lg">
                  "Labbayk Allahumma Labbayk, Labbayka la shareeka laka Labbayk,<br />
                  Innal-hamda wan-ni'mata laka wal-mulk, la shareeka lak."
                </p>
                <p className="text-sm text-muted-foreground italic">
                  (Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Indeed, all praise, blessings, and sovereignty belong to You. You have no partner.)
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 7: Avoiding Prohibited Acts */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              7️⃣ Avoiding Prohibited Acts After Ihram
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Once in Ihram, certain actions become prohibited:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4 mb-4">
              <li>❌ Cutting hair or nails</li>
              <li>❌ Using perfume</li>
              <li>❌ Wearing stitched garments (men)</li>
              <li>❌ Covering head (men) or face (women)</li>
              <li>❌ Hunting or harming animals</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed italic">
              <strong>Why?</strong> These rules preserve the sacred state and teach self-discipline and humility.
            </p>
          </section>

          {/* Section 8: Practical Tips */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🌿 Practical Preparation Tips
            </h2>
            <div className="bg-muted p-6 rounded-lg">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Carry a small unscented hygiene kit.</li>
                <li>Keep spare safety pins or clips for Ihram.</li>
                <li>Stay hydrated and rest before travel.</li>
                <li>Reflect on forgiveness and patience.</li>
              </ul>
            </div>
          </section>

          {/* Section 9: Spiritual Reflection */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              💭 Spiritual Reflection
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Each Sunnah act before Ihram — from bathing to prayer — is a renewal of the soul. It's as if the pilgrim stands before Allah saying:
            </p>
            <Card className="bg-accent/5 border-accent/20 mb-6">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground">
                  "O Allah, I come to You purified, humble, and ready to serve."
                </blockquote>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-l-4" style={{ borderLeftColor: '#2C7A7B' }}>
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground mb-2">
                  "Take provisions, but indeed, the best provision is Taqwa (God-consciousness)."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Qur'an 2:197</cite>
              </CardContent>
            </Card>
          </section>

          {/* Section 10: Related Reading */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              📚 Related Reading
            </h2>
            <div className="grid gap-4">
              <Link to="/blog/how-to-wear-ihram">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-foreground font-medium">
                      How to Wear Ihram – Step-by-Step Guide
                    </span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </CardContent>
                </Card>
              </Link>
              <Link to="/shop">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-foreground font-medium">
                      Shop the Pure Ihram Hajj Towel Set
                    </span>
                    <ShoppingCart className="h-4 w-4" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>

          {/* Closing Dua */}
          <section className="mb-12">
            <Card className="bg-gradient-subtle border-0">
              <CardContent className="p-8 text-center">
                <blockquote className="text-xl italic text-foreground mb-2">
                  "May Allah accept your pilgrimage, forgive your sins, and return you purified — just as you were born."
                </blockquote>
                <p className="text-sm text-muted-foreground mt-4">— Ameen</p>
              </CardContent>
            </Card>
          </section>
        </article>

        {/* CTA Section */}
        <Card className="bg-gradient-subtle border-0 mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Prepare for Your Sacred Journey
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Order your premium Ihram towel set today and begin your pilgrimage with comfort, confidence, and spiritual readiness.
            </p>
            <Link to="/shop">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Shop Ihram Set
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SunnahActsBlog;
