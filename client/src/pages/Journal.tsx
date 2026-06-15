import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  Coffee,
  Plus,
  Star,
  Calendar,
  MapPin,
  Filter,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function Journal() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // Story 5.1 / FR-13: edit + delete + photo replace/remove.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string>("");
  const [removePhoto, setRemovePhoto] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState({
    beanName: "",
    origin: "",
    roastLevel: "medium" as const,
    grindSize: "medium" as const,
    brewMethod: "pour_over" as const,
    waterTemp: "",
    brewTime: "",
    coffeeAmount: "",
    waterAmount: "",
    rating: 0,
    tastingNotes: "",
    observations: "",
  });

  // tRPC queries and mutations
  const { data: entries = [], isLoading, refetch } = trpc.brewJournal.list.useQuery(
    { brewMethod: filterMethod !== "all" ? filterMethod : undefined },
    { enabled: isAuthenticated }
  );

  const createMutation = trpc.brewJournal.create.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Brew entry added successfully!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to add entry: ${error.message}`);
    },
  });

  const updateMutation = trpc.brewJournal.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Brew entry updated!");
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update entry: ${error.message}`);
    },
  });

  const deleteMutation = trpc.brewJournal.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Brew entry deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete entry: ${error.message}`);
    },
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      beanName: "",
      origin: "",
      roastLevel: "medium",
      grindSize: "medium",
      brewMethod: "pour_over",
      waterTemp: "",
      brewTime: "",
      coffeeAmount: "",
      waterAmount: "",
      rating: 0,
      tastingNotes: "",
      observations: "",
    });
    setPhotoPreview("");
    setPhotoFile(null);
    setEditingId(null);
    setExistingPhotoUrl("");
    setRemovePhoto(false);
  };

  const openCreate = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEdit = (entry: (typeof entries)[number]) => {
    setFormData({
      beanName: entry.beanName,
      origin: entry.origin,
      roastLevel: entry.roastLevel as any,
      grindSize: entry.grindSize as any,
      brewMethod: entry.brewMethod as any,
      waterTemp: entry.waterTemp ?? "",
      brewTime: entry.brewTime ?? "",
      coffeeAmount: entry.coffeeAmount ?? "",
      waterAmount: entry.waterAmount ?? "",
      rating: entry.rating,
      tastingNotes: entry.tastingNotes ?? "",
      observations: entry.observations ?? "",
    });
    setEditingId(entry.id);
    setExistingPhotoUrl(entry.photoUrl ?? "");
    setPhotoPreview("");
    setPhotoFile(null);
    setRemovePhoto(false);
    setIsDialogOpen(true);
  };

  const handleDelete = (entry: (typeof entries)[number]) => {
    if (window.confirm(`Delete the entry for "${entry.beanName}"? This cannot be undone.`)) {
      deleteMutation.mutate({ id: entry.id });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.beanName || !formData.origin) {
      toast.error("Please fill in bean name and origin");
      return;
    }

    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
        // Only send a new photo if one was picked; otherwise honor removal.
        photoData: photoPreview || undefined,
        removePhoto: !photoPreview && removePhoto ? true : undefined,
      });
    } else {
      createMutation.mutate({
        ...formData,
        photoData: photoPreview || undefined,
      });
    }
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            } ${interactive ? "cursor-pointer hover:fill-primary/50" : ""}`}
            onClick={() => interactive && setFormData({ ...formData, rating: star })}
          />
        ))}
      </div>
    );
  };

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <button onClick={handleGoHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-8 w-8" />
              <span className="text-xl font-semibold">{APP_TITLE}</span>
            </button>
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                Please log in to access your brew journal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
                Log In
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Filter and sort entries
  const filteredEntries = [...entries].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={handleGoHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-8 w-8" />
            <span className="text-xl font-semibold">{APP_TITLE}</span>
          </button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId !== null ? "Edit Brew Entry" : "Add Brew Entry"}</DialogTitle>
                <DialogDescription>
                  Record your brewing experiment with all the details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload (Story 5.1 / FR-13: replace or remove when editing) */}
                <div className="space-y-2">
                  <Label>Photo (Optional)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="flex-1"
                    />
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg" />
                    ) : existingPhotoUrl && !removePhoto ? (
                      <div className="flex items-center gap-2">
                        <img src={existingPhotoUrl} alt="Current" className="h-20 w-20 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label="Remove photo"
                          onClick={() => setRemovePhoto(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  {existingPhotoUrl && removePhoto && !photoPreview && (
                    <p className="text-xs text-muted-foreground">
                      Photo will be removed when you save.{" "}
                      <button type="button" className="underline" onClick={() => setRemovePhoto(false)}>
                        Undo
                      </button>
                    </p>
                  )}
                </div>

                {/* Bean Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="beanName">Bean Name *</Label>
                    <Input
                      id="beanName"
                      value={formData.beanName}
                      onChange={(e) => setFormData({ ...formData, beanName: e.target.value })}
                      placeholder="e.g., Ethiopian Yirgacheffe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin *</Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      placeholder="e.g., Ethiopia"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roastLevel">Roast Level</Label>
                    <Select value={formData.roastLevel} onValueChange={(value: any) => setFormData({ ...formData, roastLevel: value })}>
                      <SelectTrigger id="roastLevel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="medium_dark">Medium-Dark</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grindSize">Grind Size</Label>
                    <Select value={formData.grindSize} onValueChange={(value: any) => setFormData({ ...formData, grindSize: value })}>
                      <SelectTrigger id="grindSize">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="extra_fine">Extra Fine</SelectItem>
                        <SelectItem value="fine">Fine</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="coarse">Coarse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Brewing Parameters */}
                <div className="space-y-2">
                  <Label htmlFor="brewMethod">Brew Method</Label>
                  <Select value={formData.brewMethod} onValueChange={(value: any) => setFormData({ ...formData, brewMethod: value })}>
                    <SelectTrigger id="brewMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pour_over">Pour Over</SelectItem>
                      <SelectItem value="french_press">French Press</SelectItem>
                      <SelectItem value="aeropress">AeroPress</SelectItem>
                      <SelectItem value="espresso">Espresso</SelectItem>
                      <SelectItem value="drip">Drip</SelectItem>
                      <SelectItem value="cold_brew">Cold Brew</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waterTemp">Water Temp (°F)</Label>
                    <Input
                      id="waterTemp"
                      value={formData.waterTemp}
                      onChange={(e) => setFormData({ ...formData, waterTemp: e.target.value })}
                      placeholder="e.g., 200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brewTime">Brew Time</Label>
                    <Input
                      id="brewTime"
                      value={formData.brewTime}
                      onChange={(e) => setFormData({ ...formData, brewTime: e.target.value })}
                      placeholder="e.g., 3:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coffeeAmount">Coffee (g)</Label>
                    <Input
                      id="coffeeAmount"
                      value={formData.coffeeAmount}
                      onChange={(e) => setFormData({ ...formData, coffeeAmount: e.target.value })}
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waterAmount">Water Amount (g or ml)</Label>
                  <Input
                    id="waterAmount"
                    value={formData.waterAmount}
                    onChange={(e) => setFormData({ ...formData, waterAmount: e.target.value })}
                    placeholder="e.g., 300"
                  />
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Rating</Label>
                  {renderStars(formData.rating, true)}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="tastingNotes">Tasting Notes</Label>
                  <Textarea
                    id="tastingNotes"
                    value={formData.tastingNotes}
                    onChange={(e) => setFormData({ ...formData, tastingNotes: e.target.value })}
                    placeholder="Describe the flavors you tasted..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observations & Adjustments</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="What worked well? What would you change next time?"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId !== null ? "Save Changes" : "Save Entry"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Brew Journal</h1>
          <p className="text-lg text-muted-foreground">
            Track your brewing experiments and refine your technique
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="pour_over">Pour Over</SelectItem>
                <SelectItem value="french_press">French Press</SelectItem>
                <SelectItem value="aeropress">AeroPress</SelectItem>
                <SelectItem value="espresso">Espresso</SelectItem>
                <SelectItem value="drip">Drip</SelectItem>
                <SelectItem value="cold_brew">Cold Brew</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Most Recent</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entries Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredEntries.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Coffee className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No entries yet</h3>
              <p className="text-muted-foreground mb-6">Start recording your brewing experiments</p>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="hover:border-primary/50 transition-colors"
              >
                {entry.photoUrl && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={entry.photoUrl}
                      alt={entry.beanName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-xl">{entry.beanName}</CardTitle>
                    {renderStars(entry.rating)}
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-3 w-3" />
                      {entry.origin}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{entry.brewMethod.replace("_", " ")}</Badge>
                    <Badge variant="outline">{entry.roastLevel.replace("_", " ")}</Badge>
                  </div>
                  {entry.tastingNotes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.tastingNotes}
                    </p>
                  )}
                  {/* Story 5.1: edit & delete actions */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(entry)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label={`Delete entry ${entry.beanName}`}
                      onClick={() => handleDelete(entry)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
