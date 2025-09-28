import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-bold text-foreground">Pure Ihraam</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Providing pure, comfortable Ihraam cloth for pilgrims across Sweden, the Nordics, and Europe. 
              Made with the intention of reward and accessibility for all.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Shop", href: "/shop" },
                { name: "Guides & Knowledge", href: "/blog" },
                { name: "Shipping & Delivery", href: "/shipping" },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Service Areas</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>🇸🇪 Sweden (3-7 days)</li>
              <li>🇳🇴 Norway (7-14 days)</li>
              <li>🇩🇰 Denmark (7-14 days)</li>
              <li>🇫🇮 Finland (7-14 days)</li>
              <li>🇪🇺 EU Countries (7-14 days)</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">info@pureihraam.se</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">+46 XXX XXX XXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">Sweden</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Pure Ihraam. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-muted-foreground text-xs italic max-w-md">
              "Take provisions, but the best provision is Taqwa (God-consciousness)." — Qur'an 2:197
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;