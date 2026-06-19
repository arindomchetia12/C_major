import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Star, MapPin, Wrench } from "lucide-react";
import { Provider } from "@workspace/api-client-react/src/generated/api.schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link href={`/providers/${provider.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-card-border overflow-hidden flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start mb-2">
            <Avatar className="h-12 w-12 border-2 border-primary/10">
              <AvatarImage src={provider.avatarUrl || ""} alt={provider.name} />
              <AvatarFallback className="bg-primary/5 text-primary font-bold">
                {provider.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Badge variant="secondary" className="bg-accent/10 text-accent-foreground hover:bg-accent/20 border-0 flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              {provider.trade}
            </Badge>
          </div>
          <CardTitle className="font-display text-xl text-primary">{provider.name}</CardTitle>
          <CardDescription className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {provider.city}, {provider.state}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-bold text-foreground">{provider.averageRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({provider.reviewCount})</span>
            </div>
            {provider.yearsExperience ? (
              <span className="text-sm font-medium text-muted-foreground">
                {provider.yearsExperience} yrs exp.
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
