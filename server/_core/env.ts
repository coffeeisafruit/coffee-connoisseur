export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // OpenRouter (migration M1.1): OpenAI-compatible LLM gateway replacing Forge.
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
  llmModel: process.env.LLM_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free",
  // DO Spaces (migration M3.1): S3-compatible object storage replacing Forge storage.
  spacesEndpoint: process.env.SPACES_ENDPOINT ?? "", // e.g. https://nyc3.digitaloceanspaces.com
  spacesRegion: process.env.SPACES_REGION ?? "us-east-1",
  spacesBucket: process.env.SPACES_BUCKET ?? "",
  spacesKey: process.env.SPACES_KEY ?? "",
  spacesSecret: process.env.SPACES_SECRET ?? "",
  spacesPublicBaseUrl: process.env.SPACES_PUBLIC_BASE_URL ?? "", // optional CDN/base; falls back to endpoint/bucket
  // Better Auth (migration M5): self-hosted email/password auth.
  betterAuthSecret: process.env.BETTER_AUTH_SECRET ?? "",
  betterAuthUrl: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
};
