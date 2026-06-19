import { useState } from "react";
import { useLocation } from "wouter";
import { useListProviders, useListTrades } from "@workspace/api-client-react";
import { ProviderCard } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal, Loader2 } from "lucide-react";

export default function ProvidersList() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [trade, setTrade] = useState(searchParams.get("trade") || "all");
  const [loc, setLoc] = useState(searchParams.get("location") || "");

  const { data: trades } = useListTrades();
  
  const { data: providers, isLoading } = useListProviders({
    q: q || undefined,
    trade: trade !== "all" ? trade : undefined,
    location: loc || undefined,
  }, { query: { queryKey: ["/api/providers", q, trade, loc] } });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (trade !== "all") params.set("trade", trade);
    if (loc) params.set("location", loc);
    setLocation(`/providers?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Find a Pro</h1>
          <p className="text-muted-foreground mt-2 text-lg">Browse local, verified tradespeople ready to work.</p>
        </div>
        <Button className="font-bold bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setLocation('/providers/new')}>
          List Your Trade
        </Button>
      </div>

      <div className="bg-card border rounded-xl p-4 mb-10 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search names or keywords..." 
              className="pl-10"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <Select value={trade} onValueChange={setTrade}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Any Trade" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Trade</SelectItem>
                {trades?.map(t => (
                  <SelectItem key={t.trade} value={t.trade}>{t.trade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="City or State..." 
              className="pl-10"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full md:w-auto font-bold px-8">
            Filter
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : providers?.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <p className="text-xl font-display font-medium text-foreground mb-2">No pros found</p>
          <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
          <Button variant="outline" onClick={() => { setQ(""); setTrade("all"); setLoc(""); setLocation("/providers"); }}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {providers?.map(provider => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
