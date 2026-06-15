// Better Auth client (migration M5.3). Same-origin: the server mounts the auth
// handler at /api/auth/*.
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
});

export const { signIn, signUp, signOut, useSession } = authClient;
