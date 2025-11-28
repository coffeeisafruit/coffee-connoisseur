import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { APP_LOGO, APP_TITLE } from "@/const";
import { ArrowLeft, ArrowRight, Coffee } from "lucide-react";
import { useLocation } from "wouter";

interface QuizAnswer {
  questionId: string;
  answer: string;
}

interface Question {
  id: string;
  category: string;
  question: string;
  options: { value: string; label: string; description?: string }[];
}

const questions: Question[] = [
  {
    id: "flavor_preference",
    category: "Flavor Preferences",
    question: "Which flavor profiles do you typically enjoy in food and beverages?",
    options: [
      { value: "bright_fruity", label: "Bright & Fruity", description: "Citrus, berries, tropical fruits" },
      { value: "sweet_caramel", label: "Sweet & Caramel", description: "Chocolate, caramel, vanilla" },
      { value: "nutty_earthy", label: "Nutty & Earthy", description: "Nuts, cocoa, tobacco" },
      { value: "bold_spicy", label: "Bold & Spicy", description: "Dark chocolate, spices, smoky" },
    ],
  },
  {
    id: "roast_preference",
    category: "Roast Level",
    question: "How do you prefer your coffee roasted?",
    options: [
      { value: "light", label: "Light Roast", description: "Bright, acidic, complex flavors" },
      { value: "medium", label: "Medium Roast", description: "Balanced, smooth, versatile" },
      { value: "medium_dark", label: "Medium-Dark Roast", description: "Rich, full-bodied, lower acidity" },
      { value: "dark", label: "Dark Roast", description: "Bold, intense, smoky notes" },
    ],
  },
  {
    id: "taste_sensitivity",
    category: "Taste Sensitivity",
    question: "How do you feel about bitterness in coffee?",
    options: [
      { value: "avoid", label: "I avoid it", description: "Prefer smooth, sweet coffees" },
      { value: "slight", label: "A little is fine", description: "Balanced with other flavors" },
      { value: "moderate", label: "I enjoy moderate bitterness", description: "Adds depth and complexity" },
      { value: "love", label: "I love bold, bitter coffee", description: "The stronger, the better" },
    ],
  },
  {
    id: "acidity_preference",
    category: "Acidity Level",
    question: "What's your preference for acidity (brightness) in coffee?",
    options: [
      { value: "high", label: "High Acidity", description: "Bright, wine-like, vibrant" },
      { value: "medium", label: "Medium Acidity", description: "Balanced and approachable" },
      { value: "low", label: "Low Acidity", description: "Smooth, mellow, easy on stomach" },
      { value: "none", label: "Minimal Acidity", description: "Very smooth and mild" },
    ],
  },
  {
    id: "brewing_method",
    category: "Brewing Method",
    question: "Which brewing method do you use most often (or want to try)?",
    options: [
      { value: "pour_over", label: "Pour Over", description: "V60, Chemex, Kalita" },
      { value: "french_press", label: "French Press", description: "Full-bodied, rich" },
      { value: "aeropress", label: "AeroPress", description: "Versatile, clean" },
      { value: "espresso", label: "Espresso", description: "Concentrated, intense" },
      { value: "drip", label: "Drip/Auto", description: "Convenient, consistent" },
    ],
  },
  {
    id: "origin_interest",
    category: "Origin Preference",
    question: "Which coffee-growing region interests you most?",
    options: [
      { value: "african", label: "African", description: "Ethiopia, Kenya - fruity, floral" },
      { value: "central_american", label: "Central American", description: "Guatemala, Costa Rica - balanced, nutty" },
      { value: "south_american", label: "South American", description: "Colombia, Brazil - chocolatey, smooth" },
      { value: "asian", label: "Asian/Pacific", description: "Indonesia, Papua New Guinea - earthy, full-bodied" },
      { value: "no_preference", label: "No Preference", description: "I'm open to exploring all regions" },
    ],
  },
  {
    id: "sweetness_level",
    category: "Sweetness",
    question: "How much sweetness do you prefer in your coffee?",
    options: [
      { value: "very_sweet", label: "Very Sweet", description: "I add sugar or sweeteners" },
      { value: "naturally_sweet", label: "Naturally Sweet", description: "Prefer beans with natural sweetness" },
      { value: "balanced", label: "Balanced", description: "Some sweetness, not too much" },
      { value: "minimal", label: "Minimal Sweetness", description: "Prefer complex, less sweet profiles" },
    ],
  },
  {
    id: "body_preference",
    category: "Body & Mouthfeel",
    question: "What body (thickness/weight) do you prefer in coffee?",
    options: [
      { value: "light", label: "Light Body", description: "Tea-like, delicate, clean" },
      { value: "medium", label: "Medium Body", description: "Balanced, smooth" },
      { value: "full", label: "Full Body", description: "Rich, creamy, substantial" },
      { value: "heavy", label: "Heavy Body", description: "Syrupy, intense mouthfeel" },
    ],
  },
];

// Profile generation function
function generateProfileType(answersMap: Record<string, string>): { profileType: string; profileDescription: string } {
  const flavor = answersMap.flavor_preference;
  const acidity = answersMap.acidity_preference;
  const roast = answersMap.roast_preference;
  const taste = answersMap.taste_sensitivity;
  const sweetness = answersMap.sweetness_level;
  const body = answersMap.body_preference;

  if (flavor === "bright_fruity" && acidity === "high") {
    return {
      profileType: "The Bright Enthusiast",
      profileDescription: "You love vibrant, fruity coffees with high acidity and complex flavor profiles. Ethiopian and Kenyan beans are your best match."
    };
  } else if (roast === "dark" && taste === "love") {
    return {
      profileType: "The Bold Traditionalist",
      profileDescription: "You prefer strong, bold coffees with deep, intense flavors and full body. Dark roasts from Sumatra or Brazil suit your palate."
    };
  } else if (flavor === "sweet_caramel" && sweetness === "very_sweet") {
    return {
      profileType: "The Sweet Seeker",
      profileDescription: "You enjoy smooth, sweet coffees with caramel and chocolate notes. Colombian and Brazilian beans will delight your taste buds."
    };
  } else if (acidity === "low" && body === "full") {
    return {
      profileType: "The Smooth Operator",
      profileDescription: "You prefer smooth, low-acid coffees with a rich, full body. Look for medium-dark roasts from Central America."
    };
  } else if (flavor === "nutty_earthy") {
    return {
      profileType: "The Earthy Connoisseur",
      profileDescription: "You appreciate earthy, nutty coffees with grounded, complex flavors. Indonesian and Brazilian beans are perfect for you."
    };
  }
  
  return {
    profileType: "The Balanced Explorer",
    profileDescription: "You appreciate a well-rounded coffee experience with balanced flavors. Medium roasts from various origins will satisfy your palate."
  };
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  
  const saveProfileMutation = trpc.userProfile.save.useMutation({
    onSuccess: () => {
      toast.success("Profile saved successfully!");
      setLocation("/profile");
    },
    onError: (error) => {
      toast.error(`Failed to save profile: ${error.message}`);
      // Fallback to URL parameters
      const queryParams = new URLSearchParams();
      answers.forEach(a => queryParams.append(a.questionId, a.answer));
      setLocation(`/profile?${queryParams.toString()}`);
    },
  });

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleNext = () => {
    if (!currentAnswer) return;

    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { questionId: currentQuestion.id, answer: currentAnswer };
    } else {
      newAnswers.push({ questionId: currentQuestion.id, answer: currentAnswer });
    }
    
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
      const nextQuestion = questions[currentStep + 1];
      const nextAnswer = newAnswers.find(a => a.questionId === nextQuestion.id);
      setCurrentAnswer(nextAnswer?.answer || "");
    } else {
      // Quiz complete, save to database or navigate to results
      const answersMap: Record<string, string> = {};
      newAnswers.forEach(a => {
        answersMap[a.questionId] = a.answer;
      });
      
      const { profileType, profileDescription } = generateProfileType(answersMap);
      
      if (isAuthenticated) {
        // Save to database
        saveProfileMutation.mutate({
          flavorPreference: answersMap.flavor_preference,
          roastPreference: answersMap.roast_preference,
          tasteSensitivity: answersMap.taste_sensitivity,
          acidityPreference: answersMap.acidity_preference,
          brewingMethod: answersMap.brewing_method,
          originInterest: answersMap.origin_interest,
          sweetnessLevel: answersMap.sweetness_level,
          bodyPreference: answersMap.body_preference,
          profileType,
          profileDescription,
        });
      } else {
        // Fallback to URL parameters if not authenticated
        const queryParams = new URLSearchParams();
        newAnswers.forEach(a => queryParams.append(a.questionId, a.answer));
        setLocation(`/profile?${queryParams.toString()}`);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevQuestion = questions[currentStep - 1];
      const prevAnswer = answers.find(a => a.questionId === prevQuestion.id);
      setCurrentAnswer(prevAnswer?.answer || "");
    }
  };

  const handleHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={handleHome} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={APP_LOGO} alt="Coffee Connoisseur" className="h-8 w-8" />
            <span className="text-xl font-semibold">{APP_TITLE}</span>
          </button>
        </div>
      </nav>

      {/* Quiz Content */}
      <main className="flex-1 container py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
              <Coffee className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover Your Coffee Profile
            </h1>
            <p className="text-lg text-muted-foreground">
              Answer {questions.length} questions to get personalized coffee recommendations
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Question {currentStep + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="text-sm font-medium text-primary mb-2">
                {currentQuestion.category}
              </div>
              <CardTitle className="text-2xl md:text-3xl">
                {currentQuestion.question}
              </CardTitle>
              <CardDescription className="text-base">
                Select the option that best describes your preference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.value}
                      className={`relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        currentAnswer === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setCurrentAnswer(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                      <Label
                        htmlFor={option.value}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="font-semibold mb-1">{option.label}</div>
                        {option.description && (
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!currentAnswer}
            >
              {currentStep === questions.length - 1 ? "See Results" : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
