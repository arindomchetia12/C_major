import { Link } from "wouter";
import { Hammer, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-primary font-display font-bold text-xl tracking-tight">
            <Hammer className="h-6 w-6 text-accent" />
            <span>Local Leads</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/providers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Find a Pro
            </Link>
            <Link href="/providers/new">
              <Button className="font-bold">List Your Trade</Button>
            </Link>
          </nav>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/40 py-12">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <div className="flex justify-center items-center gap-2 mb-4 text-primary font-display font-bold text-lg">
            <Hammer className="h-5 w-5 text-accent" />
            <span>Local Leads</span>
          </div>
          <p>The no-nonsense directory for hard-working tradespeople.</p>
          <p className="mt-2">&copy; {new Date().getFullYear()} Local Leads. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
