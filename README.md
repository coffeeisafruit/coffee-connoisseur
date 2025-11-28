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
- AWS S3 bucket (for image storage)
- Google Maps API key

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
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET_NAME=your_bucket_name
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

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

