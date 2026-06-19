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
    const trade = form.getValues("trade");
    const yrs = form.getValues("yearsExperience");
    if (!trade) {
      toast({ title: "Trade required", description: "Please fill in your trade first to generate a bio.", variant: "destructive" });
      return;
    }
    
    const specsArray = specialties.split(',').map(s => s.trim()).filter(Boolean);

    generateDesc.mutate({ data: { trade, yearsExperience: yrs || 1, specialties: specsArray, tone } }, {
      onSuccess: (res) => {
        form.setValue("bio", res.description);
        toast({ title: "Bio generated!", description: "Review and edit as needed." });
      },
      onError: () => {
        toast({ title: "Generation failed", description: "Could not generate bio at this time.", variant: "destructive" });
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

              <div className="border-t pt-8">
                <div className="mb-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-display font-bold">About You</h3>
                    <p className="text-sm text-muted-foreground">Tell customers why they should hire you. Use AI to generate a great bio.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex-1 space-y-2">
                      <FormLabel>Specialties (comma separated)</FormLabel>
                      <Input 
                        placeholder="e.g. Copper piping, Water heaters" 
                        value={specialties}
                        onChange={(e) => setSpecialties(e.target.value)}
                      />
                    </div>
                    <div className="w-full sm:w-48 space-y-2">
                      <FormLabel>Tone</FormLabel>
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
