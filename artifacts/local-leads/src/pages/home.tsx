import { useState } from "react";
import { useLocation } from "wouter";
import { Search, ArrowRight, ShieldCheck, Wrench, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetStats, useListTrades } from "@workspace/api-client-react";
import { ProviderCard } from "@/components/shared";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: trades, isLoading: tradesLoading } = useListTrades();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/providers?q=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation(`/providers`);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356f12?q=80&w=2070&auto=format&fit=crop')] opacity-10 mix-blend-overlay bg-cover bg-center" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-6 leading-tight">
            Find local pros <br className="hidden md:block"/> you can actually trust.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            The neighborhood notice board gone digital. Connect directly with plumbers, electricians, and tradespeople in your area.
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto bg-card p-2 rounded-xl shadow-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="What do you need help with? (e.g. Plumber)" 
                className="pl-10 h-12 border-0 focus-visible:ring-0 text-foreground bg-transparent text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 font-bold bg-accent text-accent-foreground hover:bg-accent/90">
              Find Pros
            </Button>
          </form>

          <div className="mt-12 flex justify-center gap-8 text-sm font-medium opacity-80">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/> Verified Reviews</div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5"/> Direct Contact</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x border-border">
            <div className="py-4 md:py-0">
              <p className="text-4xl font-display font-bold text-primary">
                {statsLoading ? "-" : stats?.totalProviders || 0}
              </p>
              <p className="text-muted-foreground mt-1 font-medium">Local Pros Listed</p>
            </div>
            <div className="py-4 md:py-0">
              <p className="text-4xl font-display font-bold text-primary">
                {statsLoading ? "-" : stats?.totalReviews || 0}
              </p>
              <p className="text-muted-foreground mt-1 font-medium">Customer Reviews</p>
            </div>
            <div className="py-4 md:py-0">
              <p className="text-4xl font-display font-bold text-accent">
                {statsLoading ? "-" : stats?.topTrade || "General"}
              </p>
              <p className="text-muted-foreground mt-1 font-medium">Most In-Demand Trade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trades Categories */}
      <section className="py-20 container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">Browse by Trade</h2>
            <p className="text-muted-foreground">Find the right specialist for your specific job.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tradesLoading ? (
            Array.from({length: 8}).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))
          ) : (
            trades?.map(trade => (
              <Button
                key={trade.trade}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:border-accent hover:text-accent border-2 transition-all"
                onClick={() => setLocation(`/providers?trade=${encodeURIComponent(trade.trade)}`)}
              >
                <Wrench className="h-6 w-6 mb-1 opacity-70" />
                <span className="font-bold text-base">{trade.trade}</span>
                <span className="text-xs text-muted-foreground font-normal">{trade.count} pros</span>
              </Button>
            ))
          )}
        </div>
      </section>

      {/* Recent Providers */}
      <section className="py-20 bg-muted/20 border-t">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Recently Joined</h2>
              <p className="text-muted-foreground">The newest hard-working tradespeople in the network.</p>
            </div>
            <Button variant="ghost" className="font-bold text-primary hidden sm:flex" onClick={() => setLocation('/providers')}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading ? (
              Array.from({length: 4}).map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
              ))
            ) : (
              stats?.recentProviders.map(provider => (
                <ProviderCard key={provider.id} provider={provider} />
              ))
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" className="w-full font-bold" onClick={() => setLocation('/providers')}>
              View All Pros
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
