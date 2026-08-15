import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { CheckCircle, Coffee } from "lucide-react";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
            <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-8 w-8" />
            <span className="text-xl font-semibold">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setLocation("/quiz")}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Success Section */}
      <section className="flex-1 flex items-center justify-center py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="text-center space-y-6 pb-6">
                <div className="mx-auto h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-3xl mb-3">Welcome to Coffee Connoisseur Pro!</CardTitle>
                  <CardDescription className="text-lg">
                    Your subscription is now active. Time to perfect your coffee journey.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                  <Coffee className="h-8 w-8 text-primary mx-auto" />
                  <h3 className="font-semibold text-lg">What's Next?</h3>
                  <ul className="text-left space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Take the palate profile quiz to get personalized recommendations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Start logging your brews in the journal with photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Discover local roasters and read community reviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Explore competition-winning brew recipes</span>
                    </li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="flex-1" onClick={() => setLocation("/quiz")}>
                    Start Palate Quiz
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1" onClick={() => setLocation("/journal")}>
                    Go to Brew Journal
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  A confirmation email has been sent to your inbox.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
