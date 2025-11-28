import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import {
  Coffee,
  MapPin,
  Thermometer,
  Droplets,
  Award,
  TrendingUp,
  Home,
  Share2,
  Download,
} from "lucide-react";

interface ProfileData {
  profileType: string;
  profileDescription: string;
  roastLevel: string;
  flavorNotes: string[];
  recommendedOrigins: string[];
  brewingMethods: string[];
  brewingTips: string[];
  beanRecommendations: { name: string; origin: string; notes: string }[];
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const answers = {
      flavor_preference: params.get("flavor_preference") || "",
      roast_preference: params.get("roast_preference") || "",
      taste_sensitivity: params.get("taste_sensitivity") || "",
      acidity_preference: params.get("acidity_preference") || "",
      brewing_method: params.get("brewing_method") || "",
      origin_interest: params.get("origin_interest") || "",
      sweetness_level: params.get("sweetness_level") || "",
      body_preference: params.get("body_preference") || "",
    };

    // Generate profile based on answers
    const generatedProfile = generateProfile(answers);
    setProfile(generatedProfile);
  }, []);

  const generateProfile = (answers: Record<string, string>): ProfileData => {
    // Determine profile type based on answers
    let profileType = "The Balanced Explorer";
    let profileDescription = "You appreciate a well-rounded coffee experience with balanced flavors.";

    if (answers.flavor_preference === "bright_fruity" && answers.acidity_preference === "high") {
      profileType = "The Bright Enthusiast";
      profileDescription = "You love vibrant, fruity coffees with high acidity and complex flavor profiles.";
    } else if (answers.roast_preference === "dark" && answers.taste_sensitivity === "love") {
      profileType = "The Bold Traditionalist";
      profileDescription = "You prefer strong, bold coffees with deep, intense flavors and full body.";
    } else if (answers.flavor_preference === "sweet_caramel" && answers.sweetness_level === "very_sweet") {
      profileType = "The Sweet Seeker";
      profileDescription = "You enjoy smooth, sweet coffees with caramel and chocolate notes.";
    } else if (answers.acidity_preference === "low" && answers.body_preference === "full") {
      profileType = "The Smooth Operator";
      profileDescription = "You prefer smooth, low-acid coffees with a rich, full body.";
    } else if (answers.flavor_preference === "nutty_earthy") {
      profileType = "The Earthy Connoisseur";
      profileDescription = "You appreciate earthy, nutty coffees with grounded, complex flavors.";
    }

    // Determine roast level
    const roastMap: Record<string, string> = {
      light: "Light Roast",
      medium: "Medium Roast",
      medium_dark: "Medium-Dark Roast",
      dark: "Dark Roast",
    };
    const roastLevel = roastMap[answers.roast_preference] || "Medium Roast";

    // Determine flavor notes
    const flavorMap: Record<string, string[]> = {
      bright_fruity: ["Citrus", "Berry", "Floral", "Stone Fruit"],
      sweet_caramel: ["Caramel", "Chocolate", "Vanilla", "Toffee"],
      nutty_earthy: ["Almond", "Hazelnut", "Cocoa", "Tobacco"],
      bold_spicy: ["Dark Chocolate", "Cinnamon", "Clove", "Smoky"],
    };
    const flavorNotes = flavorMap[answers.flavor_preference] || ["Balanced", "Smooth", "Classic"];

    // Determine recommended origins
    const originMap: Record<string, string[]> = {
      african: ["Ethiopia", "Kenya", "Rwanda"],
      central_american: ["Guatemala", "Costa Rica", "Honduras"],
      south_american: ["Colombia", "Brazil", "Peru"],
      asian: ["Sumatra", "Java", "Papua New Guinea"],
      no_preference: ["Ethiopia", "Colombia", "Guatemala", "Sumatra"],
    };
    const recommendedOrigins = originMap[answers.origin_interest] || ["Colombia", "Ethiopia"];

    // Determine brewing methods
    const brewingMap: Record<string, string[]> = {
      pour_over: ["V60", "Chemex", "Kalita Wave"],
      french_press: ["French Press", "Cold Brew"],
      aeropress: ["AeroPress", "Pour Over"],
      espresso: ["Espresso Machine", "Moka Pot"],
      drip: ["Auto Drip", "Pour Over"],
    };
    const brewingMethods = brewingMap[answers.brewing_method] || ["Pour Over", "French Press"];

    // Generate brewing tips
    const brewingTips = [
      `Water temperature: ${answers.roast_preference === "light" ? "200-205°F (93-96°C)" : "195-200°F (90-93°C)"}`,
      `Grind size: ${answers.brewing_method === "french_press" ? "Coarse" : answers.brewing_method === "espresso" ? "Fine" : "Medium"}`,
      `Coffee-to-water ratio: Start with 1:15 to 1:17 and adjust to taste`,
      `Brew time: ${answers.brewing_method === "french_press" ? "4 minutes" : answers.brewing_method === "pour_over" ? "2.5-3 minutes" : "Varies by method"}`,
    ];

    // Generate bean recommendations
    const beanRecommendations = [
      {
        name: recommendedOrigins[0] ? `${recommendedOrigins[0]} Single Origin` : "Ethiopian Yirgacheffe",
        origin: recommendedOrigins[0] || "Ethiopia",
        notes: flavorNotes.slice(0, 2).join(", "),
      },
      {
        name: recommendedOrigins[1] ? `${recommendedOrigins[1]} Estate` : "Colombian Supremo",
        origin: recommendedOrigins[1] || "Colombia",
        notes: flavorNotes.slice(1, 3).join(", "),
      },
      {
        name: "House Blend",
        origin: "Multi-Origin",
        notes: "Balanced, Versatile",
      },
    ];

    return {
      profileType,
      profileDescription,
      roastLevel,
      flavorNotes,
      recommendedOrigins,
      brewingMethods,
      brewingTips,
      beanRecommendations,
    };
  };

  const handleRetakeQuiz = () => {
    setLocation("/quiz");
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Generating your coffee profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={handleGoHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-8 w-8" />
            <span className="text-xl font-semibold">{APP_TITLE}</span>
          </button>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <main className="flex-1 container py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Award className="h-3 w-3 mr-1" />
              Your Coffee Profile
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {profile.profileType}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {profile.profileDescription}
            </p>
          </div>

          {/* Profile Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Coffee className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Roast Level</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{profile.roastLevel}</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Recommended Origins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.recommendedOrigins.map((origin, index) => (
                    <Badge key={index} variant="secondary">
                      {origin}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Flavor Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.flavorNotes.map((note, index) => (
                    <Badge key={index} variant="outline">
                      {note}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bean Recommendations */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Recommended Beans</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {profile.beanRecommendations.map((bean, index) => (
                <Card key={index} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-muted">
                      <img
                        src="/coffee-beans.jpg"
                        alt={bean.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-xl">{bean.name}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-4 w-4" />
                        {bean.origin}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Notes: {bean.notes}
                    </p>
                    <Button variant="outline" className="w-full">
                      Find Local Roasters
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Brewing Guide */}
          <section className="mb-12">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-2">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Thermometer className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Brewing Methods</CardTitle>
                  <CardDescription>
                    Best methods for your profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.brewingMethods.map((method, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Coffee className="h-5 w-5 text-primary" />
                        <span className="font-medium">{method}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <Droplets className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Brewing Tips</CardTitle>
                  <CardDescription>
                    Optimize your brew for best results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {profile.brewingTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Next Steps */}
          <section className="bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect with local roasters, track your coffee inventory, and discover new beans that match your unique profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGoHome}>
                <Home className="h-4 w-4 mr-2" />
                Explore Features
              </Button>
              <Button size="lg" variant="outline" onClick={handleRetakeQuiz}>
                Retake Quiz
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
