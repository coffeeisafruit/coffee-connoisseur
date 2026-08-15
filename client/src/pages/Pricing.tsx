import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { Check, Coffee } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const checkoutMutation = trpc.payment.createCheckoutSession.useMutation();

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const result = await checkoutMutation.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Unable to start checkout. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    "Unlimited palate profile assessments",
    "Full access to brew journal with photo uploads",
    "Personalized coffee bean recommendations",
    "Local roaster network and reviews",
    "Competition-winning brew recipes",
    "Grind size pairing for your equipment",
    "Standardized feedback system",
    "Bean cellar inventory tracking",
    "Seasonal recommendations",
    "Community features and badges",
    "AI-powered brew assistance",
    "Priority support"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-8 w-8" />
            <span className="text-xl font-semibold">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/")}>Home</Button>
            <Button variant="ghost" onClick={() => setLocation("/roasters")}>Find Roasters</Button>
            <Button onClick={() => setLocation("/quiz")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mx-auto w-fit">
              <Coffee className="h-3 w-3 mr-1" />
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Perfect Your Coffee Journey
            </h1>
            <p className="text-xl text-muted-foreground">
              Get full access to all features and start brewing better coffee today.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Card */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary shadow-lg">
              <CardHeader className="text-center space-y-4 pb-8">
                <CardTitle className="text-3xl">Coffee Connoisseur Pro</CardTitle>
                <CardDescription className="text-lg">
                  Everything you need to master your coffee experience
                </CardDescription>
                <div className="pt-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">$9.99</span>
                    <span className="text-xl text-muted-foreground">/month</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Button 
                    size="lg" 
                    className="w-full text-lg" 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                  >
                    {isLoading ? "Starting checkout..." : "Subscribe Now"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    Cancel anytime. No long-term commitment required.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-12">
            <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards and debit cards through our secure payment processor, Stripe.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Can I cancel my subscription?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time from your profile settings. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Is there a free trial?</h3>
                <p className="text-muted-foreground">
                  We offer limited access to help you get started. Subscribe to unlock all features including unlimited brew journal entries, photo uploads, and personalized recommendations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  If you're not satisfied within the first 14 days, contact our support team for a full refund.
                </p>
              </div>
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
                <li><a href="/" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="/roasters" className="hover:text-foreground transition-colors">Roaster Partners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="text-muted-foreground/50">Discord - Coming Soon</span></li>
                <li><span className="text-muted-foreground/50">Blog - Coming Soon</span></li>
                <li><span className="text-muted-foreground/50">Events - Coming Soon</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="text-muted-foreground/50">About - Coming Soon</span></li>
                <li><span className="text-muted-foreground/50">Contact - Coming Soon</span></li>
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
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
