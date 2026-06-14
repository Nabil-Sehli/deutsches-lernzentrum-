# Deutsches Lernzentrum (German Learning Center)

A full-stack platform for managing German language learning centers. Teachers can submit center creation requests, and admins can approve or reject them through a built-in admin portal.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Hono, tRPC v11, Drizzle ORM
- **Database:** MySQL
- **Auth:** JWT (jose) + bcrypt
- **i18n:** i18next (DE/EN)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env  # configure your MySQL connection

# Push database schema
npm run db:push

# Seed admin user
npm run db:seed

# Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend + API |
| `npm run start` | Production start |
| `npm run check` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema to database |

## Project Structure

```
├── api/              # Backend (Hono + tRPC routers)
│   ├── auth-router.ts
│   ├── center-request-router.ts
│   ├── middleware.ts
│   └── queries/
├── db/               # Database schema & seed
│   ├── schema.ts
│   ├── relations.ts
│   ├── seed.ts
│   └── index.ts
├── src/              # Frontend
│   ├── components/   # UI components (shadcn + custom)
│   ├── pages/        # Route pages
│   ├── providers/    # tRPC, i18n, theme
│   ├── lib/          # Form schemas, helpers
│   └── data/         # Static data (countries, etc.)
├── public/
└── scripts/
```
