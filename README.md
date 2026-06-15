# Coffee Connoisseur

A full-stack web application for coffee enthusiasts to discover, track, and perfect their brewing experience.

## Features

- **Brew Journal**: Track your coffee brewing sessions with detailed parameters, photos, and tasting notes
- **Palate Quiz**: Discover your coffee preferences through an interactive quiz
- **Roaster Map**: Find local coffee roasters with Google Maps integration
- **Bean Recommendations**: Get personalized coffee recommendations based on your profile
- **Competition Recipes**: Access professional brewing recipes for pour over and AeroPress

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI
- **Backend**: Express, tRPC, Node.js
- **Database**: MySQL with Drizzle ORM
- **Storage**: AWS S3 for image uploads
- **Authentication**: JWT-based auth
- **Maps**: Google Maps API

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (package manager)
- MySQL database
- Manus **Forge proxy** credentials (image storage, Google Maps, and the LLM are
  reached through the platform proxy — no raw AWS/Maps/OpenAI keys are used by the
  running app)

> **Note:** Earlier docs referenced raw AWS S3 / Google Maps / OpenAI keys. The
> live code path uses the Manus Forge proxy via `BUILT_IN_FORGE_API_URL` /
> `BUILT_IN_FORGE_API_KEY` (see [`docs/integration-architecture.md`](docs/integration-architecture.md)).
> The unused `@aws-sdk/*` dependencies were removed.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coffee-connoisseur
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_mysql_connection_string
JWT_SECRET=your_jwt_secret
VITE_APP_ID=your_oauth_app_id
VITE_OAUTH_PORTAL_URL=your_oauth_portal_url
OAUTH_SERVER_URL=your_oauth_server_url
OWNER_OPEN_ID=optional_admin_openid
# Platform-injected on Manus; required for storage/maps/LLM features:
BUILT_IN_FORGE_API_URL=your_forge_proxy_url
BUILT_IN_FORGE_API_KEY=your_forge_proxy_key
```

> **Running tests:** the test suite is integration-style and requires a MySQL
> reachable via `DATABASE_URL` (e.g. `docker run -d -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=coffee -p 3307:3306 mysql:8`),
> then `pnpm db:push` before `pnpm test`. Start from a clean database.

4. Run database migrations:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm check` - Type check without emitting files
- `pnpm format` - Format code with Prettier
- `pnpm db:push` - Generate and apply database migrations

## Project Structure

```
coffee-connoisseur/
├── client/          # Frontend React application
├── server/          # Backend Express/tRPC server
├── shared/          # Shared types and utilities
├── drizzle/         # Database migrations and schema
└── scripts/         # Utility scripts
```

## License

MIT


