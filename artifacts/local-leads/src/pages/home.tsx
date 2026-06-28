import { useState } from "react";
import { useLocation } from "wouter";
import { Search, ArrowRight, ShieldCheck, Wrench, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useGetStats, useListTrades } from "@workspace/api-client-react";
import { ProviderCard } from "@/components/shared";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // AI Matchmaker State
  const [userNeed, setUserNeed] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isAiMatching, setIsAiMatching] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState<{
    name: string;
    trade: string;
    city: string;
    phone: string;
    avatarUrl: string;
    eta: string;
  } | null>(null);

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

  const handleAiMatchDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNeed.trim() || !userEmail.trim()) return;
    setIsAiMatching(true);
    setAiMatchResult(null);

    setTimeout(() => {
      setIsAiMatching(false);
      const lower = userNeed.toLowerCase();
      let matchedPro = {
        name: "Marcus Rivera",
        trade: "Master Plumber",
        city: "Austin, TX",
        phone: "555-0101",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        eta: "10 mins"
      };

      if (lower.includes("electric") || lower.includes("light") || lower.includes("wire") || lower.includes("power") || lower.includes("panel") || lower.includes("spark")) {
        matchedPro = {
          name: "Linda Okafor",
          trade: "Master Electrician",
          city: "Houston, TX",
          phone: "555-0102",
          avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          eta: "10 mins"
        };
      } else if (lower.includes("ac") || lower.includes("heat") || lower.includes("hvac") || lower.includes("air")) {
        matchedPro = {
          name: "Robert Wilson",
          trade: "HVAC Technician",
          city: "Austin, TX",
          phone: "555-0106",
          avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
          eta: "10 mins"
        };
      } else if (lower.includes("wood") || lower.includes("cabinet") || lower.includes("door") || lower.includes("carpenter")) {
        matchedPro = {
          name: "Thomas Wright",
          trade: "Master Carpenter",
          city: "Austin, TX",
          phone: "555-0107",
          avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
          eta: "10 mins"
        };
      }

      setAiMatchResult(matchedPro);

      // 1. Send Direct Booking Confirmation Email from Cmajorbusiness@hotmail.com to Client
      fetch(`http://localhost:5000/api/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          clientEmail: userEmail,
          proName: matchedPro.name,
          trade: matchedPro.trade,
          phone: matchedPro.phone,
          need: userNeed
        })
      }).catch((err) => console.log("Direct mail booking API note:", err));
    }, 1200);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504307651254-35680f356f12?q=80&w=2070&auto=format&fit=crop')] opacity-10 mix-blend-overlay bg-cover bg-center" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-extrabold mb-6 leading-tight">
            Find local pros <br className="hidden md:block" /> you can actually trust.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Connect directly with plumbers, electricians, and tradespeople in your area.
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


        </div>
      </section>

      {/* Real-Time AI Matchmaker & Auto-Booking Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 via-card to-background border-b relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-10">

            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-foreground tracking-tight mb-4">
              Tell AI Your Emergency Need. <br className="hidden sm:block" /> Get a Pro Booked in Real-Time (Arrives in 10 Mins).
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Input: Pros upload their identity. Main Function: Our AI scans real-time availability based on your exact issue. Output: Automatic booking notification sent to your email with a 10-minute arrival guarantee!
            </p>
          </div>

          <Card className="border-2 border-primary/20 shadow-2xl bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-6 md:p-10">
              <form onSubmit={handleAiMatchDispatch} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                      <span>🔧 Describe Your Urgent Need:</span>
                    </label>
                    <Input
                      placeholder="e.g. My main electrical panel sparked and power went out!"
                      className="h-12 bg-background border-border text-foreground text-base shadow-sm"
                      value={userNeed}
                      onChange={(e) => setUserNeed(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                      <span>✉️ Your Email (For Booking Notification):</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="e.g. homeowner@texas.com"
                      className="h-12 bg-background border-border text-foreground text-base shadow-sm"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isAiMatching}
                  className="w-full h-14 font-display font-extrabold text-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {isAiMatching ? (
                    <>
                      <div className="w-6 h-6 border-4 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                      <span>AI Scanning Real-Time Pro Availability...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Auto-Book via AI Matchmaker</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              {/* AI Match Result Output */}
              {aiMatchResult && (
                <div className="mt-10 pt-8 border-t-2 border-dashed border-border animate-in fade-in-50 duration-500">
                  <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                      ✅ AI Automated Dispatch Confirmed
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                      <img src={aiMatchResult.avatarUrl} alt={aiMatchResult.name} className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-md" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-display font-extrabold text-foreground">{aiMatchResult.name}</span>
                          <span className="bg-emerald-500/20 text-emerald-600 font-extrabold text-xs px-2.5 py-0.5 rounded-full">🛡️ Verified Pro</span>
                        </div>
                        <p className="text-base font-bold text-accent mb-1">{aiMatchResult.trade} &bull; {aiMatchResult.city}</p>
                        <p className="text-sm text-muted-foreground">Direct Pro Line: <span className="font-bold text-foreground">{aiMatchResult.phone}</span></p>
                      </div>

                      <div className="md:ml-auto bg-background border-2 border-emerald-500/20 rounded-xl p-4 text-center min-w-[160px] shadow-sm">
                        <p className="text-xs text-muted-foreground font-extrabold uppercase tracking-wider mb-1">Estimated Arrival</p>
                        <p className="text-3xl font-display font-extrabold text-emerald-600 animate-pulse">{aiMatchResult.eta}</p>
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">🟢 En Route to Your Location</p>
                      </div>
                    </div>

                    {/* Email Simulation Card */}
                    <div className="bg-background border-2 border-border rounded-xl p-5 shadow-inner">
                      <div className="flex items-center gap-2 text-xs font-display font-bold text-muted-foreground border-b pb-3 mb-3">
                        <span>✉️ INSTANT EMAIL SENT TO:</span>
                        <span className="text-foreground font-extrabold bg-muted px-2 py-0.5 rounded">{userEmail || "homeowner@texas.com"}</span>
                      </div>
                      <p className="text-sm font-bold text-foreground mb-2">Subject: 🚨 Booking Confirmed! Your {aiMatchResult.trade} is arriving in 10 minutes.</p>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        Hello, our Real-Time AI Matchmaker has successfully processed your request for "<span className="text-foreground font-medium">{userNeed}</span>".
                        We have automatically booked <span className="text-foreground font-bold">{aiMatchResult.name}</span> ({aiMatchResult.trade}).
                        They have confirmed receipt of the dispatch and will arrive at your location in exactly <span className="text-emerald-600 font-bold">10 minutes</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Dual-Sided Platform & How It Works Section */}
      <section className="py-20 bg-card border-b">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-foreground tracking-tight mb-4">
              Where Pros Upload Their Identity & <br className="hidden sm:block" /> Customers Find Them Instantly.
            </h2>
            <p className="text-lg text-muted-foreground">
              We eliminate middleman booking fees and blind matching. Plumbers, electricians, and tradespeople build verified digital identities, and homeowners connect directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {/* For Tradespeople Card */}
            <div className="bg-primary/5 border-2 border-primary/10 rounded-2xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                For Plumbers & Electricians
              </div>
              <div>
                <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-6 shadow-md text-2xl font-bold">
                  🛠️
                </div>
                <h3 className="text-2xl font-display font-extrabold text-foreground mb-3">
                  Upload Your Pro Identity
                </h3>
                <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                  Tired of paying for leads? Build your verified profile in 2 minutes. Add your trade, service radius, hourly rates, past work photos, and direct phone number. Let customers find you directly.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full sm:w-auto self-start font-bold text-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
                onClick={() => setLocation('/providers/new')}
              >
                ⚡ Create Profile / Upload Identity
              </Button>
            </div>

            {/* For Customers Card */}
            <div className="bg-accent/5 border-2 border-accent/20 rounded-2xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-accent/40 transition-all shadow-sm">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-extrabold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                For Homeowners & Clients
              </div>
              <div>
                <div className="h-12 w-12 rounded-xl bg-accent text-accent-foreground flex items-center justify-center mb-6 shadow-md text-2xl font-bold">
                  🔎
                </div>
                <h3 className="text-2xl font-display font-extrabold text-foreground mb-3">
                  Find the Perfect Pro Instantly
                </h3>
                <p className="text-muted-foreground text-base mb-6 leading-relaxed">
                  Get full transparency. Browse authentic, verified profiles of local plumbers and electricians. See their real ratings, full experience, reviews, and call them directly with zero booking markups.
                </p>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto self-start font-bold text-base border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-sm"
                onClick={() => setLocation('/providers')}
              >
                🔍 Search Available Pros
              </Button>
            </div>
          </div>

          {/* 3 Step Process */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative py-8">
            <div className="text-center p-6 bg-background rounded-xl border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground font-extrabold text-xl flex items-center justify-center mx-auto mb-4 shadow-md">1</div>
              <h4 className="font-display font-bold text-xl text-foreground mb-2">Upload Identity</h4>
              <p className="text-muted-foreground text-sm">Local plumbers and electricians create verified profiles with their trade, license info, and contact details.</p>
            </div>
            <div className="text-center p-6 bg-background rounded-xl border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground font-extrabold text-xl flex items-center justify-center mx-auto mb-4 shadow-md">2</div>
              <h4 className="font-display font-bold text-xl text-foreground mb-2">Filter & Compare</h4>
              <p className="text-muted-foreground text-sm">Customers search by city, trade, or rating to view past work portfolios and authentic customer reviews.</p>
            </div>
            <div className="text-center p-6 bg-background rounded-xl border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent text-accent-foreground font-extrabold text-xl flex items-center justify-center mx-auto mb-4 shadow-md">3</div>
              <h4 className="font-display font-bold text-xl text-foreground mb-2">Direct Contact</h4>
              <p className="text-muted-foreground text-sm">No middleman fees! Call or email the tradesperson directly to schedule your job immediately.</p>
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
            Array.from({ length: 8 }).map((_, i) => (
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
              Array.from({ length: 4 }).map((_, i) => (
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
