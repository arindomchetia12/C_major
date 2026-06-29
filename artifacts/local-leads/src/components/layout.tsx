import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Hammer, Menu, X, Home, Search, UserPlus, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Home",        href: "/",          icon: <Home className="w-4 h-4" /> },
  { label: "Find a Pro",  href: "/providers", icon: <Search className="w-4 h-4" /> },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 text-primary font-display font-bold text-xl tracking-tight">
            <img src="/c-major-logo.jpg" alt="C major Logo" className="h-8 w-8 rounded-full object-cover shadow-sm" />
            <span>C major</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150
                    ${location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              </Link>
            ))}
            <Link href="/providers/new">
              <Button className="ml-2 font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-md flex items-center gap-2 text-sm px-5 py-2.5 h-auto">
                ⚡ Join as a Pro
              </Button>
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden border-t bg-background/98 backdrop-blur px-4 py-4 flex flex-col gap-1 shadow-lg">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}>
                <button
                  onClick={() => setMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150
                    ${location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                    }`}
                >
                  {link.icon}
                  {link.label}
                </button>
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t">
              <Link href="/providers/new">
                <Button
                  className="w-full font-bold bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => setMenuOpen(false)}
                >
                  ⚡ Join as a Pro (Upload Identity)
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/40 py-12">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <div className="flex justify-center items-center gap-2.5 mb-3 text-primary font-display font-bold text-lg">
            <img src="/c-major-logo.jpg" alt="C major Logo" className="h-6 w-6 rounded-full object-cover shadow-sm" />
            <span>C major</span>
          </div>
          <p className="mb-6">The no-nonsense directory for hard-working tradespeople.</p>

          <p className="mt-2">&copy; {new Date().getFullYear()} C major. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
