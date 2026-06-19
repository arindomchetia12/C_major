import { useParams, Link } from "wouter";
import { useGetProvider, useListPortfolio, useListReviews, useCreateReview } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Star, Edit, ShieldCheck, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListReviewsQueryKey, getGetProviderQueryKey } from "@workspace/api-client-react";

const reviewSchema = z.object({
  reviewerName: z.string().min(2, "Name is required"),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, "Please provide more detail in your review"),
});

export default function ProviderProfile() {
  const { id } = useParams<{ id: string }>();
  const providerId = parseInt(id, 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: provider, isLoading } = useGetProvider(providerId, { query: { enabled: !!providerId, queryKey: getGetProviderQueryKey(providerId) } });
  const { data: portfolio } = useListPortfolio(providerId, { query: { enabled: !!providerId } });
  const { data: reviews } = useListReviews(providerId, { query: { enabled: !!providerId } });
  
  const createReview = useCreateReview();

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { reviewerName: "", rating: 5, comment: "" },
  });

  const onSubmitReview = (data: z.infer<typeof reviewSchema>) => {
    createReview.mutate({ id: providerId, data }, {
      onSuccess: () => {
        toast({ title: "Review submitted", description: "Thanks for sharing your experience!" });
        form.reset();
        queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey(providerId) });
        queryClient.invalidateQueries({ queryKey: getGetProviderQueryKey(providerId) });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not submit review", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!provider) return <div className="p-8 text-center">Provider not found</div>;

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 max-w-5xl">
      {/* Header Profile Section */}
      <div className="bg-card border rounded-2xl p-6 md:p-10 shadow-sm mb-8 flex flex-col md:flex-row gap-8 items-start">
        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-lg bg-muted">
          <AvatarImage src={provider.avatarUrl || ""} className="object-cover" />
          <AvatarFallback className="text-4xl font-display text-primary bg-primary/5">
            {provider.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 w-full">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-accent text-accent-foreground hover:bg-accent px-3 py-1 font-bold text-sm">
                  {provider.trade}
                </Badge>
                {provider.isVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50 gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-display font-extrabold text-foreground mb-2">{provider.name}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> {provider.city}, {provider.state}
                </div>
                <div className="flex items-center gap-1.5 text-foreground">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-bold">{provider.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({provider.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            
            <Link href={`/providers/${provider.id}/edit`}>
              <Button variant="outline" className="w-full md:w-auto font-bold gap-2">
                <Edit className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border/50">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Phone</p>
                <p className="font-bold text-foreground">{provider.phone || "Not provided"}</p>
              </div>
            </div>
            {provider.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Email</p>
                  <p className="font-bold text-foreground">{provider.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground font-medium">Experience</p>
                <p className="font-bold text-foreground">{provider.yearsExperience ? `${provider.yearsExperience} Years` : "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 w-full justify-start h-auto bg-transparent border-b rounded-none p-0">
          <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-bold text-base">Overview</TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-bold text-base">Portfolio ({portfolio?.length || 0})</TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 font-bold text-base">Reviews ({reviews?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="focus-visible:outline-none">
          <div className="prose prose-neutral max-w-none prose-p:leading-relaxed text-lg text-muted-foreground">
            <h3 className="font-display text-2xl font-bold text-foreground mb-4">About {provider.name.split(' ')[0]}</h3>
            {provider.bio ? (
              <div className="whitespace-pre-wrap">{provider.bio}</div>
            ) : (
              <p className="italic">No bio provided yet.</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="portfolio" className="focus-visible:outline-none">
          {portfolio?.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
              <p className="text-muted-foreground">No portfolio items uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {portfolio?.map((item) => (
                <Card key={item.id} className="overflow-hidden border-0 shadow-sm bg-muted/20">
                  <div className="aspect-[4/3] w-full relative">
                    <img src={item.imageUrl} alt={item.caption} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-medium text-foreground">{item.caption}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="focus-visible:outline-none flex flex-col md:flex-row gap-10">
          <div className="flex-1 space-y-6">
            {reviews?.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                <p className="text-muted-foreground">No reviews yet. Be the first!</p>
              </div>
            ) : (
              reviews?.map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-foreground text-lg">{review.reviewerName}</p>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="w-full md:w-96 bg-card border rounded-xl p-6 shadow-sm h-fit sticky top-24">
            <h3 className="font-display text-xl font-bold mb-6">Leave a Review</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                <FormField control={form.control} name="reviewerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl><Input placeholder="John D." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rating" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (1-5)</FormLabel>
                    <FormControl><Input type="number" min="1" max="5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="comment" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review</FormLabel>
                    <FormControl><Textarea placeholder="How was the service?" className="resize-none" rows={4} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full font-bold" disabled={createReview.isPending}>
                  {createReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
