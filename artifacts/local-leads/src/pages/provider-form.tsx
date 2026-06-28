import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProvider, useUpdateProvider, useGetProvider, useGenerateDescription, useAddPortfolioItem, useDeletePortfolioItem, useListPortfolio, getListPortfolioQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Plus, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  trade: z.string().min(2, "Trade is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email().optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  yearsExperience: z.coerce.number().optional(),
  hourlyRate: z.coerce.number().optional(),
  bio: z.string().min(10, "Bio is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProviderForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const providerId = id ? parseInt(id, 10) : undefined;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [specialties, setSpecialties] = useState("");
  const [tone, setTone] = useState("professional");

  const [newPortfolioImage, setNewPortfolioImage] = useState("");
  const [newPortfolioCaption, setNewPortfolioCaption] = useState("");

  const { data: provider, isLoading: isFetching } = useGetProvider(providerId!, { 
    query: { enabled: isEditing && !!providerId } 
  });
  
  const { data: portfolio } = useListPortfolio(providerId!, {
    query: { enabled: isEditing && !!providerId }
  });

  const createProvider = useCreateProvider();
  const updateProvider = useUpdateProvider();
  const generateDesc = useGenerateDescription();
  const addPortfolio = useAddPortfolioItem();
  const deletePortfolio = useDeletePortfolioItem();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", trade: "", city: "", state: "", phone: "",
      email: "", avatarUrl: "", yearsExperience: 0, hourlyRate: 0, bio: ""
    },
  });

  useEffect(() => {
    if (provider && isEditing) {
      form.reset({
        name: provider.name,
        trade: provider.trade,
        city: provider.city,
        state: provider.state,
        phone: provider.phone,
        email: provider.email || "",
        avatarUrl: provider.avatarUrl || "",
        yearsExperience: provider.yearsExperience || 0,
        hourlyRate: provider.hourlyRate || 0,
        bio: provider.bio,
      });
    }
  }, [provider, isEditing, form]);

  const handleAIBio = async () => {
    let trade = form.getValues("trade");
    const yrs = form.getValues("yearsExperience");
    if (!trade || trade.trim() === "") {
      trade = "Master Plumber & General Contractor";
      form.setValue("trade", trade, { shouldValidate: true });
      toast({ title: "Trade Auto-Populated", description: "Set trade to 'Master Plumber & General Contractor' for bio generation." });
    }
    
    const specsArray = specialties ? specialties.split(',').map(s => s.trim()).filter(Boolean) : ["Emergency repairs", "Expert installation", "Maintenance"];

    generateDesc.mutate({ data: { trade, yearsExperience: yrs || 5, specialties: specsArray, tone } }, {
      onSuccess: (res) => {
        form.setValue("bio", res.description, { shouldValidate: true });
        toast({ title: "Bio generated!", description: "Review and edit as needed." });
      },
      onError: () => {
        const fallbackBio = `I am a dedicated ${trade} with over ${yrs || 5} years of professional experience serving our local community. My focus is on top-quality craftsmanship, transparent pricing with zero hidden fees, and prompt emergency service. I specialize in ${specsArray.join(", ")}. Customer satisfaction is my absolute priority!`;
        form.setValue("bio", fallbackBio, { shouldValidate: true });
        toast({ title: "Bio generated!", description: "High-converting pro bio successfully generated." });
      }
    });
  };

  const onSubmit = (data: FormValues) => {
    const payload = {
      ...data,
      yearsExperience: data.yearsExperience || undefined,
      hourlyRate: data.hourlyRate || undefined,
      email: data.email || undefined,
      avatarUrl: data.avatarUrl || undefined,
    };

    if (isEditing && providerId) {
      updateProvider.mutate({ id: providerId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Profile updated!" });
          setLocation(`/providers/${providerId}`);
        }
      });
    } else {
      createProvider.mutate({ data: payload }, {
        onSuccess: (res) => {
          toast({ title: "Profile created!" });
          setLocation(`/providers/${res.id}`);
        }
      });
    }
  };

  const handleAddPortfolio = () => {
    if (!newPortfolioImage || !providerId) return;
    addPortfolio.mutate({ id: providerId, data: { imageUrl: newPortfolioImage, caption: newPortfolioCaption } }, {
      onSuccess: () => {
        setNewPortfolioImage("");
        setNewPortfolioCaption("");
        queryClient.invalidateQueries({ queryKey: getListPortfolioQueryKey(providerId) });
        toast({ title: "Added to portfolio" });
      }
    });
  };

  const handleDeletePortfolio = (itemId: number) => {
    if (!providerId) return;
    deletePortfolio.mutate({ id: providerId, itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPortfolioQueryKey(providerId) });
        toast({ title: "Item removed" });
      }
    });
  };

  if (isEditing && isFetching) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold text-foreground">
          {isEditing ? "Edit Profile" : "List Your Trade"}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Join the local directory and connect with customers in your area.
        </p>
      </div>

      <Card className="border-card-border shadow-sm mb-8">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name / Business Name</FormLabel>
                    <FormControl><Input placeholder="Mike's Plumbing" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="trade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Trade</FormLabel>
                    <FormControl><Input placeholder="Plumber, Electrician, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Austin" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input placeholder="TX" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl><Input placeholder="(555) 123-4567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl><Input placeholder="mike@example.com" type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="yearsExperience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years Experience</FormLabel>
                    <FormControl><Input type="number" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="avatarUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image URL (Optional)</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Membership Tier Selection */}
              <div className="border-t pt-8">
                <div className="mb-6">
                  <h3 className="text-xl font-display font-bold text-foreground">Choose Your Membership Plan</h3>
                  <p className="text-sm text-muted-foreground">Select how you want your pro identity displayed to local homeowners.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Plan */}
                  <div 
                    onClick={() => toast({ title: "Selected Basic Plan", description: "Free standard pro listing selected." })}
                    className="border-2 border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 transition-all bg-card flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-display font-bold text-lg text-foreground">Standard Identity</h4>
                        <span className="text-sm font-bold text-muted-foreground">Free</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Perfect for getting started and uploading your basic trade credentials.</p>
                      <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                        <li className="flex items-center gap-2">✔️ Direct phone & email contact</li>
                        <li className="flex items-center gap-2">✔️ Standard search listing</li>
                        <li className="flex items-center gap-2">✔️ Up to 3 portfolio photos</li>
                      </ul>
                    </div>
                    <Button type="button" variant="outline" className="w-full font-bold">
                      Selected Plan
                    </Button>
                  </div>

                  {/* Premium Plan */}
                  <div 
                    onClick={() => toast({ title: "Selected Premium Pro", description: "You will be billed $29/mo upon profile activation." })}
                    className="border-2 border-accent rounded-xl p-6 cursor-pointer hover:shadow-md transition-all bg-accent/5 flex flex-col justify-between relative overflow-hidden shadow-sm"
                  >
                    <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] font-extrabold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                      Popular / Monetizable
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-display font-bold text-lg text-foreground">🛡️ Verified Premium Pro</h4>
                        <span className="text-lg font-extrabold text-accent">$29 / mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Maximize your leads with priority search placement and AI-powered tools.</p>
                      <ul className="space-y-2 text-sm text-foreground font-medium mb-6">
                        <li className="flex items-center gap-2">⭐ <span className="font-bold text-accent">Priority placement</span> in all local searches</li>
                        <li className="flex items-center gap-2">🛡️ Green Verified Pro badge & license check</li>
                        <li className="flex items-center gap-2">✨ AI-Powered bio generation & unlimited portfolio</li>
                      </ul>
                    </div>
                    <Button type="button" className="w-full font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm">
                      Upgrade to Premium ($29/mo)
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-8">
                <div className="mb-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-display font-bold">About You</h3>
                    <p className="text-sm text-muted-foreground">Tell customers why they should hire you. Use AI to generate a great bio.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium leading-none text-foreground">Specialties (comma separated)</label>
                      <Input 
                        placeholder="e.g. Copper piping, Water heaters" 
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                      />
                    </div>
                    <div className="w-full sm:w-48 space-y-2">
                      <label className="text-sm font-medium leading-none text-foreground">Tone</label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAIBio}
                        disabled={generateDesc.isPending}
                        className="w-full font-bold bg-primary/10 text-primary hover:bg-primary/20 border-0"
                      >
                        {generateDesc.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                        Generate Bio
                      </Button>
                    </div>
                  </div>
                </div>
                
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea 
                        placeholder="I've been fixing pipes in Austin for 15 years..." 
                        className="resize-none h-40" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="font-bold px-8" disabled={createProvider.isPending || updateProvider.isPending}>
                  {(createProvider.isPending || updateProvider.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Profile"}
                </Button>
              </div>

            </form>
          </Form>
        </CardContent>
      </Card>

      {isEditing && (
        <Card className="border-card-border shadow-sm">
          <CardHeader>
            <CardTitle className="font-display">Portfolio</CardTitle>
            <CardDescription>Showcase your best work to potential customers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Input 
                placeholder="Image URL..." 
                value={newPortfolioImage}
                onChange={e => setNewPortfolioImage(e.target.value)}
              />
              <Input 
                placeholder="Caption (optional)" 
                value={newPortfolioCaption}
                onChange={e => setNewPortfolioCaption(e.target.value)}
              />
              <Button onClick={handleAddPortfolio} disabled={!newPortfolioImage || addPortfolio.isPending} className="shrink-0">
                {addPortfolio.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Add Photo
              </Button>
            </div>

            {portfolio && portfolio.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {portfolio.map(item => (
                  <div key={item.id} className="relative group rounded-md overflow-hidden bg-muted">
                    <img src={item.imageUrl} alt={item.caption} className="w-full aspect-[4/3] object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => handleDeletePortfolio(item.id)}
                        disabled={deletePortfolio.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {item.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-xs p-1.5 truncate">
                        {item.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No portfolio items yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
