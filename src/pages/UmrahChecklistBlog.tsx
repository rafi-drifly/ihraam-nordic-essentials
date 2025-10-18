import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowLeft, ShoppingCart, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UmrahChecklistBlog = () => {
  const post = {
    title: "Checklist for Umrah Preparation (Clothes, Duas, Documents)",
    excerpt: "A complete guide to help you prepare mentally, physically, and spiritually before departing for Umrah.",
    author: "Travel Expert",
    readTime: "15 min read",
    date: "March 5, 2024",
    category: "Preparation",
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
            🕋 {post.title}
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
            <h2 className="text-3xl font-bold text-foreground mb-4">🌙 Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Preparing for Umrah is both exciting and humbling. It's a journey that begins long before your flight — with careful planning, spiritual focus, and readiness of heart.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To make your experience smooth and fulfilling, here's a comprehensive Umrah checklist — covering everything from travel documents and clothing to dua lists and essential items to pack.
            </p>
            <p className="text-muted-foreground leading-relaxed font-semibold">
              This guide will help ensure you can focus entirely on worship, not logistics.
            </p>
          </section>

          {/* Section 1: Essential Travel Documents */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              📋 1️⃣ Essential Travel Documents
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Before anything else, confirm your paperwork is ready and valid. Missing one document can delay your departure or entry.
            </p>

            <Card className="shadow-sm mb-6">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Document</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Passport</TableCell>
                      <TableCell>Valid for at least 6 months from travel date.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Visa / Umrah e-Visa</TableCell>
                      <TableCell>Ensure it's approved and printed.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Flight Tickets</TableCell>
                      <TableCell>Keep printed and digital copies.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Hotel Confirmation</TableCell>
                      <TableCell>Save booking details in both paper and mobile form.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Vaccination Certificates</TableCell>
                      <TableCell>Especially for meningitis and COVID-19 (as per requirement).</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Travel Insurance</TableCell>
                      <TableCell>Covers medical emergencies during your trip.</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Emergency Contacts</TableCell>
                      <TableCell>Family, embassy, and group leader numbers.</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="bg-accent/10 p-4 rounded-lg border-l-4" style={{ borderLeftColor: '#2C7A7B' }}>
              <p className="text-foreground">
                <strong>💡 Tip:</strong> Store all documents in a waterproof pouch or digital folder (Google Drive / phone).
              </p>
            </div>
          </section>

          {/* Section 2: Clothing Checklist */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🧳 2️⃣ Clothing Checklist
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Clothing for Umrah should be simple, modest, and comfortable — prioritizing spiritual focus over fashion.
            </p>

            <div className="space-y-6">
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-foreground mb-4">For Men:</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">2 sets of Ihram garments (2 white unstitched cloths each)</p>
                  </div>
                  <div className="ml-7 mb-3">
                    <Link to="/shop" className="text-primary hover:underline text-sm">
                      Recommended: Pure Ihram Quick-Dry Set (115×230 cm) →
                    </Link>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Lightweight undershorts or wrap for sleeping (non-stitched only)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Loose casual thobe / jubba</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Slippers or sandals (open-toe, no stitched straps)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Lightweight travel bag or waist pouch</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-foreground mb-4">For Women:</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">2–3 modest abayas or long dresses</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Hijabs (light colors for heat, darker for travel)</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Comfortable underscarves</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Socks and open slippers</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Small handbag for documents</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-foreground mb-4">Both:</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Small towel and flip-flops for ablution</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Sleepwear or casual outfit for rest days</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">Laundry bag and detergent sachets</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-accent/10 p-4 rounded-lg border-l-4 mt-6" style={{ borderLeftColor: '#2C7A7B' }}>
              <p className="text-foreground">
                <strong>💡 Tip:</strong> Keep one full set of Ihram and essentials in your carry-on — in case of luggage delay.
              </p>
            </div>
          </section>

          {/* Section 3: Toiletries */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🧼 3️⃣ Toiletries & Personal Care (Unscented)
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Once you enter Ihram, using scented products is not allowed. So prepare unscented items beforehand.
            </p>

            <Card className="shadow-sm mb-6">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Item</TableHead>
                      <TableHead className="font-semibold">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Toothbrush & toothpaste</TableCell>
                      <TableCell>Plain, unscented</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Soap & shampoo</TableCell>
                      <TableCell>Unscented / fragrance-free</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Towel</TableCell>
                      <TableCell>Quick-dry microfiber preferred</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Lotion / Vaseline</TableCell>
                      <TableCell>Unscented (for dryness)</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Wet wipes</TableCell>
                      <TableCell>Non-perfumed</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Deodorant</TableCell>
                      <TableCell>Unscented stick or mineral spray</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Nail cutter, comb</TableCell>
                      <TableCell>To use before Ihram</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">First aid kit</TableCell>
                      <TableCell>Band-aids, painkillers, cold meds</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="bg-accent/10 p-4 rounded-lg border-l-4" style={{ borderLeftColor: '#2C7A7B' }}>
              <p className="text-foreground">
                <strong>💡 Pro Tip:</strong> Buy travel-size containers to save luggage space.
              </p>
            </div>
          </section>

          {/* Section 4: Spiritual Preparation */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🕋 4️⃣ Spiritual Preparation
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Before the journey, focus on heart and intention — your goal is closeness to Allah, not tourism.
            </p>

            <div className="bg-muted p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">🧠 Mental & Spiritual Prep:</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Make sincere Tawbah (repentance) before travel.</li>
                <li>Settle any debts and seek forgiveness from family.</li>
                <li>Review Umrah steps (Tawaf, Sa'i, cutting hair).</li>
                <li>Watch or read guides for confidence.</li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-foreground mb-4">📖 Learn and Memorize Important Duas:</h3>
            
            <Card className="shadow-sm mb-6">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Situation</TableHead>
                      <TableHead className="font-semibold">Dua</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Leaving home</TableCell>
                      <TableCell className="text-sm">Bismillah, tawakkaltu ʿalallāh, lā ḥawla wa lā quwwata illā billāh</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Entering Makkah</TableCell>
                      <TableCell className="text-sm">Allāhumma hādhā ḥaramuka wa amnuka…</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">At the Kaabah (seeing it)</TableCell>
                      <TableCell className="text-sm">Allāhumma zid hādhā al-bayta tashrīfan wa taʿẓīman…</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">During Tawaf</TableCell>
                      <TableCell className="text-sm">Personal duas or general dhikr</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Between Safa & Marwah</TableCell>
                      <TableCell className="text-sm">Rabbighfir warḥam, wa anta al-aʿazzu al-akram</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">After Umrah</TableCell>
                      <TableCell className="text-sm">Allāhumma taqabbal minnā wa ghfir lanā</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="bg-accent/10 p-4 rounded-lg border-l-4" style={{ borderLeftColor: '#2C7A7B' }}>
              <p className="text-foreground">
                <strong>💡</strong> Keep a small pocket-sized Dua Booklet or app on your phone for easy access.
              </p>
            </div>
          </section>

          {/* Section 5: Tech & Convenience */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🕯️ 5️⃣ Tech & Convenience Essentials
            </h2>
            <div className="bg-muted p-6 rounded-lg">
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li>📱 Mobile phone & charger</li>
                <li>🔋 Portable power bank</li>
                <li>🔌 Travel adapter (Saudi plug type G)</li>
                <li>🎧 Noise-free earbuds for Qur'an recitation</li>
                <li>💧 Reusable water bottle</li>
                <li>🧎 Small travel prayer mat</li>
                <li>☂️ Lightweight umbrella for shade</li>
              </ul>
            </div>
          </section>

          {/* Section 6: Health & Safety */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🧺 6️⃣ Health & Safety
            </h2>
            <div className="bg-muted p-6 rounded-lg mb-6">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Any prescription medicines in original packaging</li>
                <li>Pain relief / fever tablets</li>
                <li>Bandages and antiseptic cream</li>
                <li>Small snacks for energy (dates, nuts, energy bars)</li>
                <li>Face masks and hand sanitizer</li>
                <li>Hydration tablets</li>
              </ul>
            </div>

            <div className="bg-accent/10 p-4 rounded-lg border-l-4" style={{ borderLeftColor: '#2C7A7B' }}>
              <p className="text-foreground">
                <strong>💡</strong> Stay hydrated — Saudi weather can be extremely dry and hot.
              </p>
            </div>
          </section>

          {/* Section 7: Sunnah Acts */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🕊️ 7️⃣ Recommended Sunnah Acts Before Ihram
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Before entering Ihram, perform:
            </p>
            <div className="bg-muted p-6 rounded-lg mb-6">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Ghusl (full bath)</li>
                <li>Trim nails and unwanted hair</li>
                <li>Apply perfume to the body (not the Ihram)</li>
                <li>Pray two rak'ahs if time permits</li>
                <li>Make niyyah and recite Talbiyah</li>
              </ul>
            </div>

            <Link to="/blog/sunnah-acts-before-ihram">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-foreground font-medium">
                    👉 Read full guide: Sunnah Acts Before Entering Ihram
                  </span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </CardContent>
              </Card>
            </Link>
          </section>

          {/* Section 8: Packing Summary */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🎒 8️⃣ Packing Checklist Summary
            </h2>
            
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Must-Haves</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Documents</TableCell>
                      <TableCell>Passport, Visa, Hotel, Insurance</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Clothing</TableCell>
                      <TableCell>Ihram, Abaya, Sandals, Thobe</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Toiletries</TableCell>
                      <TableCell>Unscented essentials</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Health</TableCell>
                      <TableCell>Medication, First aid, Water bottle</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Spiritual</TableCell>
                      <TableCell>Dua book, Tasbeeh, Qur'an app</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Technology</TableCell>
                      <TableCell>Phone, Charger, Adapter</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* Spiritual Reflection */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">💭 Spiritual Reflection</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Remember — Umrah is not just a trip; it's a sacred calling.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              When you organize your bag, your body, and your heart — you are answering the call of Allah:
            </p>
            
            <Card className="bg-accent/5 border-l-4 mb-6" style={{ borderLeftColor: '#2C7A7B' }}>
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground mb-2">
                  "And complete the Hajj and Umrah for Allah."
                </blockquote>
                <cite className="text-sm text-muted-foreground">— Qur'an 2:196</cite>
              </CardContent>
            </Card>

            <p className="text-muted-foreground leading-relaxed italic">
              Prepare your soul with the same care you pack your suitcase — and your journey will be blessed with ease and acceptance, insha'Allah.
            </p>
          </section>

          {/* Related Reading */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              🏷️ Internal Links
            </h2>
            <div className="grid gap-4">
              <Link to="/shop">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-foreground font-medium">
                      Shop Ihram Hajj Towel Set
                    </span>
                    <ShoppingCart className="h-4 w-4" />
                  </CardContent>
                </Card>
              </Link>
              <Link to="/blog/sunnah-acts-before-ihram">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-foreground font-medium">
                      Sunnah Acts Before Entering Ihram
                    </span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </CardContent>
                </Card>
              </Link>
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
            </div>
          </section>
        </article>

        {/* CTA Section */}
        <Card className="bg-gradient-subtle border-0 mt-12">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready for Your Umrah Journey?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get your premium Ihram set and prepare for a blessed pilgrimage with comfort and confidence.
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

export default UmrahChecklistBlog;