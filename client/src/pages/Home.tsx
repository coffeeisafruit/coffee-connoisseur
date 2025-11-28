import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { 
  Coffee, 
  MapPin, 
  Thermometer, 
  Scale, 
  Award, 
  Users, 
  TrendingUp, 
  BookOpen,
  Compass,
  Sparkles,
  Target,
  Trophy,
  Store,
  Calendar
} from "lucide-react";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, setLocation] = useLocation();
  const features = [
    {
      icon: Scale,
      title: "Grind Size Pairing",
      description: "Get precise grind size recommendations paired to your specific grinder type, from Virtuoso to Baratza and beyond."
    },
    {
      icon: Coffee,
      title: "Universal Flavor System",
      description: "Navigate coffee flavors with our accessible verbiage system - from light to dark roasts with detailed flavor notes underneath."
    },
    {
      icon: MapPin,
      title: "Bean Origin Stories",
      description: "Discover the geographical journey of your beans - farm details, elevation points, and the rich history behind every cup."
    },
    {
      icon: Thermometer,
      title: "Brew Recipes",
      description: "Access competition-winning recipes for pour-over, AeroPress, and more. Find your perfect water temperature and ratio."
    },
    {
      icon: Target,
      title: "Palate Profile",
      description: "Take our intake assessment to build your unique palate profile and get personalized bean recommendations."
    },
    {
      icon: TrendingUp,
      title: "Standardized Feedback",
      description: "Dial in your perfect brew faster with our feedback system that guides you to adjust extraction for your ideal taste."
    },
    {
      icon: BookOpen,
      title: "Bean Cellar",
      description: "Track your coffee inventory like a wine cellar. Know how many cups you can expect and when to restock."
    },
    {
      icon: Calendar,
      title: "Seasonal Recommendations",
      description: "Get coffee suggestions based on the season and regional availability for the freshest experience."
    },
    {
      icon: Trophy,
      title: "Gamification & Badges",
      description: "Earn badges and level up as you explore different beans, brewing methods, and perfect your coffee journey."
    },
    {
      icon: Store,
      title: "Local Roaster Network",
      description: "Connect with local small-batch roasters in your area and discover unique beans you won't find anywhere else."
    },
    {
      icon: Users,
      title: "Community Features",
      description: "Join a community of coffee enthusiasts, share your brewing experiences, and learn from fellow connoisseurs."
    },
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      description: "If you like this bean, try these. Our system learns your preferences and suggests your next favorite coffee."
    }
  ];

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const startQuiz = () => {
    setLocation('/quiz');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-8 w-8" />
            <span className="text-xl font-semibold">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={scrollToFeatures}>Features</Button>
            <Button variant="ghost" onClick={() => setLocation("/roasters")}>Find Roasters</Button>
            <Button variant="ghost" onClick={() => setLocation("/journal")}>Brew Journal</Button>
            <Button onClick={() => setLocation("/quiz")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                <Compass className="h-3 w-3 mr-1" />
                For the Connoisseur, Not the Snob
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Perfect Your Coffee Journey
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                From bean origin to the perfect brew, discover a personalized coffee experience that helps you dial in your ideal cup while connecting with local roasters and a passionate community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg" onClick={startQuiz}>
                  Start Your Journey
                </Button>
                <Button size="lg" variant="outline" className="text-lg" onClick={scrollToFeatures}>
                  Explore Features
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="/hero-coffee.jpg" 
                  alt="Pour over coffee brewing" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Competition Recipes</p>
                    <p className="text-sm text-muted-foreground">From world champions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-32 bg-background">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to Master Coffee
            </h2>
            <p className="text-xl text-muted-foreground">
              Whether you're just starting your coffee journey or you're a seasoned enthusiast, our comprehensive tools help you brew better coffee every time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bean Origin Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="/coffee-farm.jpg" 
                alt="Coffee plantation" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Know Your Bean's Story
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every cup of coffee has a journey. Discover the farms, the altitude, the processing methods, and the people behind your favorite beans. Connect with the story behind every sip and appreciate the craft that goes into each harvest.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Geographical Details</h3>
                    <p className="text-muted-foreground">Farm locations, elevation, and growing conditions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Rich History</h3>
                    <p className="text-muted-foreground">Learn about the heritage and traditions of each region</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brewing Excellence Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                Dial In Your Perfect Brew
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Stop wasting beans trying to find the right recipe. Our standardized feedback system helps you adjust your brew parameters efficiently, getting you to your ideal cup faster with less trial and error.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Minimal Testing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Learn the minimal water-to-bean ratio for testing without over-caffeinating yourself
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Smart Adjustments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Get specific recommendations to improve extraction based on your taste feedback
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div>
              <img 
                src="/brewing-setup.jpg" 
                alt="Coffee brewing setup" 
                className="rounded-2xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 md:py-32 bg-primary/5">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Join a Community of Coffee Lovers
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Connect with local roasters, discover small-batch beans, and share your coffee journey with fellow enthusiasts. Earn badges, level up, and unlock exclusive deals from our roaster partners.
            </p>
            <div className="grid sm:grid-cols-3 gap-8 pt-8">
              <div className="space-y-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Store className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Local Roasters</h3>
                <p className="text-muted-foreground">
                  Support small businesses and discover unique beans
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Earn Rewards</h3>
                <p className="text-muted-foreground">
                  Level up and unlock exclusive deals and features
                </p>
              </div>
              <div className="space-y-3">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Share & Learn</h3>
                <p className="text-muted-foreground">
                  Exchange tips and experiences with the community
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Elevate Your Coffee Experience?
            </h2>
            <p className="text-xl text-muted-foreground">
              Start your journey today and discover the perfect cup of coffee tailored to your unique palate.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg" onClick={startQuiz}>
                Take the Quiz
              </Button>
              <Button size="lg" variant="outline" className="text-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-6 w-6" />
                <span className="font-semibold">{APP_TITLE}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For the Connoisseur, Not the Snob
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Roaster Partners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Events</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 {APP_TITLE}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
