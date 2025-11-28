import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Mail,
  Filter,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface RoasterWithParsed {
  id: number;
  name: string;
  description: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string;
  latitude: string;
  longitude: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  beanOrigins: string[];
  roastStyles: string[];
  specialties: string[];
  hours: Record<string, string> | null;
  logoUrl: string | null;
  photoUrl: string | null;
  zipCode: string | null;
  averageRating: number | null;
  reviewCount: number | null;
}

export default function Roasters() {
  const [, setLocation] = useLocation();
  const [selectedRoaster, setSelectedRoaster] = useState<RoasterWithParsed | null>(null);
  const [originFilter, setOriginFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Fetch roasters with filters
  const { data: rawRoasters = [], isLoading } = trpc.roasters.list.useQuery({
    origin: originFilter !== "all" ? originFilter : undefined,
    minRating: ratingFilter > 0 ? ratingFilter : undefined,
  });

  // Parse JSON fields
  const roasters: RoasterWithParsed[] = useMemo(() => {
    return rawRoasters.map(r => ({
      ...r,
      beanOrigins: r.beanOrigins ? JSON.parse(r.beanOrigins) : [],
      roastStyles: r.roastStyles ? JSON.parse(r.roastStyles) : [],
      specialties: r.specialties ? JSON.parse(r.specialties) : [],
      hours: r.hours ? JSON.parse(r.hours) : null,
    }));
  }, [rawRoasters]);

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    setMapReady(true);
  }, []);

  // Create markers when map is ready and roasters are loaded
  useMemo(() => {
    if (!mapReady || !mapInstance || roasters.length === 0) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers: google.maps.Marker[] = [];
    const bounds = new google.maps.LatLngBounds();

    roasters.forEach((roaster) => {
      const lat = parseFloat(roaster.latitude);
      const lng = parseFloat(roaster.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return;

      const position = { lat, lng };
      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: roaster.name,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
            <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="#8B4513"/>
              <circle cx="16" cy="16" r="8" fill="white"/>
              <path d="M16 10c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2s2-.9 2-2v-2c0-1.1-.9-2-2-2z" fill="#8B4513"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 42),
          anchor: new google.maps.Point(16, 42),
        },
      });

      marker.addListener("click", () => {
        setSelectedRoaster(roaster);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      mapInstance.fitBounds(bounds);
    }
  }, [mapReady, mapInstance, roasters]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-primary text-primary"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleViewDetails = (roaster: RoasterWithParsed) => {
    setSelectedRoaster(roaster);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={handleGoHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-8 w-8" />
            <span className="text-xl font-semibold">{APP_TITLE}</span>
          </button>
          <Button variant="ghost" onClick={handleGoHome}>
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar with filters and list */}
        <div className="w-full lg:w-96 border-r bg-muted/30 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold mb-2">Local Roasters</h1>
              <p className="text-muted-foreground">
                Discover coffee roasters near you
              </p>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Bean Origin</Label>
                  <Select value={originFilter} onValueChange={setOriginFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Origins</SelectItem>
                      <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                      <SelectItem value="Colombia">Colombia</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="Guatemala">Guatemala</SelectItem>
                      <SelectItem value="Costa Rica">Costa Rica</SelectItem>
                      <SelectItem value="Indonesia">Indonesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
                  <Select value={ratingFilter.toString()} onValueChange={(v) => setRatingFilter(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Ratings</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(originFilter !== "all" || ratingFilter > 0) && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setOriginFilter("all");
                      setRatingFilter(0);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Roasters List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : roasters.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No roasters found</p>
                  </CardContent>
                </Card>
              ) : (
                roasters.map((roaster) => (
                  <Card
                    key={roaster.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleViewDetails(roaster)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{roaster.name}</CardTitle>
                        <Badge variant="secondary">
                          {roaster.averageRating || 0}/5
                        </Badge>
                      </div>
                      <CardDescription>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="h-3 w-3" />
                          {roaster.city}, {roaster.state || roaster.country}
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(roaster.averageRating || 0)}
                          <span className="text-xs ml-2">({roaster.reviewCount || 0} reviews)</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    {roaster.beanOrigins.length > 0 && (
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {roaster.beanOrigins.slice(0, 3).map((origin, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {origin}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            onMapReady={handleMapReady}
            initialCenter={{ lat: 37.7749, lng: -122.4194 }} // San Francisco
            initialZoom={12}
            className="w-full h-full min-h-[400px] lg:min-h-0"
          />
        </div>
      </div>

      {/* Roaster Detail Dialog */}
      <Dialog open={!!selectedRoaster} onOpenChange={(open) => !open && setSelectedRoaster(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRoaster && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedRoaster.name}</DialogTitle>
                <DialogDescription>
                  <div className="flex items-center gap-2 mt-2">
                    {renderStars(selectedRoaster.averageRating || 0)}
                    <span className="text-sm">({selectedRoaster.reviewCount || 0} reviews)</span>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {selectedRoaster.description && (
                  <p className="text-muted-foreground">{selectedRoaster.description}</p>
                )}

                {/* Contact Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{selectedRoaster.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedRoaster.city}, {selectedRoaster.state} {selectedRoaster.zipCode}
                        </p>
                      </div>
                    </div>
                    {selectedRoaster.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedRoaster.phone}`} className="text-sm hover:underline">
                          {selectedRoaster.phone}
                        </a>
                      </div>
                    )}
                    {selectedRoaster.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${selectedRoaster.email}`} className="text-sm hover:underline">
                          {selectedRoaster.email}
                        </a>
                      </div>
                    )}
                    {selectedRoaster.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={selectedRoaster.website} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bean Origins */}
                {selectedRoaster.beanOrigins.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Bean Origins</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoaster.beanOrigins.map((origin, idx) => (
                        <Badge key={idx} variant="secondary">
                          {origin}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Roast Styles */}
                {selectedRoaster.roastStyles.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Roast Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoaster.roastStyles.map((style, idx) => (
                        <Badge key={idx} variant="outline">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hours */}
                {selectedRoaster.hours && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hours
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedRoaster.hours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize">{day}:</span>
                          <span className="text-muted-foreground">{hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => {
                    setLocation(`/roasters/${selectedRoaster.id}`);
                  }}
                >
                  View Full Details & Reviews
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
