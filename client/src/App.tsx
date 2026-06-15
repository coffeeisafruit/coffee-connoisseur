import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import RequireAuth from "./components/RequireAuth";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Roasters from "./pages/Roasters";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {/* Protected routes (Story 2.1 / FR-14): guarded before data loads */}
      <Route path="/quiz">{() => <RequireAuth><Quiz /></RequireAuth>}</Route>
      <Route path="/profile">{() => <RequireAuth><Profile /></RequireAuth>}</Route>
      <Route path="/journal">{() => <RequireAuth><Journal /></RequireAuth>}</Route>
      {/* Public: roaster list is public; submitting a review is gated at the action */}
      <Route path="/roasters" component={Roasters} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
