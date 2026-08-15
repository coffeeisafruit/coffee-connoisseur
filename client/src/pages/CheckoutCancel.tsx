import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { XCircle, ArrowLeft } from "lucide-react";

export default function CheckoutCancel() {
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

      {/* Cancel Section */}
      <section className="flex-1 flex items-center justify-center py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 shadow-lg">
              <CardHeader className="text-center space-y-6 pb-6">
                <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-3xl mb-3">Checkout Cancelled</CardTitle>
                  <CardDescription className="text-lg">
                    No charges were made. You can return to checkout anytime.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                  <h3 className="font-semibold text-lg">Still interested?</h3>
                  <p className="text-muted-foreground">
                    Perfect your brew with personalized recommendations, expert recipes, and community insights.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="flex-1" onClick={() => setLocation("/pricing")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Pricing
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1" onClick={() => setLocation("/")}>
                    Return Home
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  Have questions? Feel free to explore our features before subscribing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
