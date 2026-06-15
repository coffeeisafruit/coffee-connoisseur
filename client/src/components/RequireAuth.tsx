import { useAuth } from "@/_core/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";
import type { ReactNode } from "react";

/**
 * Route-level auth guard (Story 2.1 / FR-14).
 *
 * Wraps protected pages so unauthenticated visitors are redirected to the OAuth
 * login *before* the page fires its data requests — no empty-page flash, no
 * failed-request side effects. The server remains the source of truth via
 * `protectedProcedure`; this is defense-in-depth on the client.
 *
 * `useAuth({ redirectOnUnauthenticated: true })` performs the redirect (and
 * already guards against redirect loops on the login path).
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: true });

  // While resolving, or when unauthenticated (redirect in flight), don't render
  // the protected content.
  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
