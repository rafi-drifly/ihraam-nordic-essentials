import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "How to Wear Ihram – A Simple Guide for Pilgrims",
      excerpt: "A step-by-step guide to properly wearing the Ihram garments, ensuring comfort and adherence to Islamic guidelines during your pilgrimage.",
      author: "Pure Ihram Team",
      readTime: "5 min read",
      date: "October 5, 2025",
      category: "Guide",
      image: "/api/placeholder/400/250",
      content: "Learn the proper way to wear your Ihram cloth with our comprehensive guide..."
    },
    {
      id: 2,
      title: "Sunnah Acts Before Entering Ihram",
      excerpt: "Discover the recommended Sunnah practices to perform before entering the state of Ihram, including personal hygiene and spiritual preparation.",
      author: "Islamic Scholar",
      readTime: "7 min read",
      date: "March 10, 2024",
      category: "Sunnah",
      image: "/api/placeholder/400/250",
      content: "Before entering the sacred state of Ihram, there are several Sunnah acts..."
    },
    {
      id: 3,
      title: "Checklist for Umrah Preparation (Clothes, Duas, Documents)",
      excerpt: "Complete checklist covering everything you need for Umrah - from essential documents to clothing requirements and important duas to memorize.",
      author: "Travel Expert",
      readTime: "10 min read",
      date: "March 5, 2024",
      category: "Preparation",
      image: "/api/placeholder/400/250",
      content: "Preparing for Umrah requires careful planning and organization..."
    },
    {
      id: 4,
      title: "Common Mistakes Pilgrims Make in Ihram",
      excerpt: "Avoid these common errors that pilgrims often make while in the state of Ihram, helping you maintain the sanctity of your pilgrimage.",
      author: "Hajj Guide",
      readTime: "6 min read",
      date: "February 28, 2024",
      category: "Tips",
      image: "/api/placeholder/400/250",
      content: "During Hajj and Umrah, pilgrims may unknowingly make mistakes..."
    },
    {
      id: 5,
      title: "The Spiritual Meaning of Ihram – Equality Before Allah",
      excerpt: "Explore the deeper spiritual significance of Ihram and how it represents the equality of all believers in the sight of Allah.",
      author: "Islamic Scholar",
      readTime: "8 min read",
      date: "February 20, 2024",
      category: "Spiritual",
      image: "/api/placeholder/400/250",
      content: "The white garments of Ihram symbolize purity and equality..."
    }
  ];

  const categories = ["All", "Guide", "Sunnah", "Preparation", "Tips", "Spiritual"];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Guides & Knowledge
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Essential guidance and knowledge for your sacred journey. Learn about Hajj, Umrah, 
            and the spiritual significance of pilgrimage from Islamic scholars and experienced guides.
          </p>
        </div>

        {/* Islamic Quote */}
        <div className="mb-12">
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-8 text-center">
              <blockquote className="text-lg italic text-foreground mb-4">
                "And proclaim to the people the Hajj; they will come to you on foot and on every lean camel; 
                they will come from every distant pass."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Qur'an 22:27</cite>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {blogPosts.map((post) => (
            <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="aspect-video bg-muted overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Article Image</span>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {post.readTime}
                  </div>
                </div>
                {post.id === 1 ? (
                  <Link to="/blog/how-to-wear-ihram">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </Link>
                ) : post.id === 2 ? (
                  <Link to="/blog/sunnah-acts-before-ihram">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </Link>
                ) : post.id === 3 ? (
                  <Link to="/blog/umrah-preparation-checklist">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </Link>
                ) : (
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                )}
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    {post.author}
                  </div>
                  {post.id === 1 ? (
                    <Link to="/blog/how-to-wear-ihram">
                      <Button size="sm" variant="ghost" className="group-hover:text-primary">
                        Read More
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  ) : post.id === 2 ? (
                    <Link to="/blog/sunnah-acts-before-ihram">
                      <Button size="sm" variant="ghost" className="group-hover:text-primary">
                        Read More
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  ) : post.id === 3 ? (
                    <Link to="/blog/umrah-preparation-checklist">
                      <Button size="sm" variant="ghost" className="group-hover:text-primary">
                        Read More
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <Button size="sm" variant="ghost" className="group-hover:text-primary">
                      Read More
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground mt-2">
                  {post.date}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Spiritual Quote Section */}
        <div className="mb-16">
          <Card className="bg-gradient-subtle border-0">
            <CardContent className="p-8 text-center">
              <blockquote className="text-xl italic text-foreground mb-4">
                "Whoever performs Hajj for the sake of Allah and does not utter any obscene 
                speech or do any evil deed, will return as pure as the day his mother gave birth to him."
              </blockquote>
              <cite className="text-sm text-muted-foreground">— Bukhari & Muslim</cite>
            </CardContent>
          </Card>
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-muted">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Stay Updated with Islamic Knowledge
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Subscribe to receive the latest articles, guides, and spiritual insights 
              to help you prepare for your pilgrimage journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground"
              />
              <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Blog;