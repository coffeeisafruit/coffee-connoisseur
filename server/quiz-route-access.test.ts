import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Route access test: verify /quiz and /profile are public (not wrapped in RequireAuth).
 * 
 * Context: The /quiz and /profile routes were causing friction for logged-out visitors.
 * Home CTAs ("Get Started", "Start Your Journey", "Take the Quiz") all lead to /quiz.
 * Quiz.tsx passes quiz answers to /profile via URL params, where Profile.tsx displays
 * results for non-authenticated users.
 * 
 * This test verifies:
 * - /quiz route is NOT wrapped in RequireAuth (public access)
 * - /profile route is NOT wrapped in RequireAuth (logged-out quiz results)
 * - /journal route REMAINS wrapped in RequireAuth (protected)
 */
describe("Quiz route accessibility", () => {
  it("should NOT wrap /quiz route in RequireAuth (logged-out users can take quiz)", () => {
    // Read the App.tsx routing configuration
    const appPath = join(process.cwd(), "client", "src", "App.tsx");
    const appSource = readFileSync(appPath, "utf-8");
    
    // Find the quiz route definition - match a single line with the route
    // Look for <Route path="/quiz"...> up to either /> or the first > if it has children
    const quizRouteMatch = appSource.match(/<Route path="\/quiz"[^/>]*\/?>/);
    
    expect(quizRouteMatch, "/quiz route should exist in App.tsx").toBeTruthy();
    
    if (quizRouteMatch) {
      const quizRouteLine = quizRouteMatch[0];
      
      // The quiz route should NOT contain RequireAuth wrapper
      // This allows logged-out visitors to take the quiz
      expect(
        quizRouteLine.includes("RequireAuth"),
        "/quiz route must not be wrapped in RequireAuth - logged-out users need access to take the quiz"
      ).toBe(false);
      
      // It should reference the Quiz component
      expect(
        quizRouteLine.includes("Quiz"),
        "/quiz route should reference Quiz component"
      ).toBe(true);
    }
  });
  
  it("should NOT wrap /profile route in RequireAuth (logged-out quiz results)", () => {
    const appPath = join(process.cwd(), "client", "src", "App.tsx");
    const appSource = readFileSync(appPath, "utf-8");
    
    const profileRouteMatch = appSource.match(/<Route path="\/profile"[^/>]*\/?>/);
    
    expect(profileRouteMatch, "/profile route should exist").toBeTruthy();
    
    if (profileRouteMatch) {
      const profileRouteLine = profileRouteMatch[0];
      
      // Profile should NOT contain RequireAuth wrapper
      // This allows logged-out users to see their quiz results
      expect(
        profileRouteLine.includes("RequireAuth"),
        "/profile route must not be wrapped in RequireAuth - logged-out users need to see quiz results"
      ).toBe(false);
      
      // It should reference the Profile component
      expect(
        profileRouteLine.includes("Profile"),
        "/profile route should reference Profile component"
      ).toBe(true);
    }
  });
  
  it("should keep /journal route wrapped in RequireAuth (protected)", () => {
    const appPath = join(process.cwd(), "client", "src", "App.tsx");
    const appSource = readFileSync(appPath, "utf-8");
    
    const journalRouteMatch = appSource.match(/<Route path="\/journal"[^>]*(?:\/>|>[\s\S]*?<\/Route>)/);
    
    expect(journalRouteMatch, "/journal route should exist").toBeTruthy();
    
    if (journalRouteMatch) {
      const journalRouteLine = journalRouteMatch[0];
      
      // Journal should remain protected
      expect(
        journalRouteLine.includes("RequireAuth"),
        "/journal route should remain wrapped in RequireAuth"
      ).toBe(true);
    }
  });
});
