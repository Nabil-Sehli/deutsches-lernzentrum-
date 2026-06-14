# Deutsches Lernzentrum (German Learning Center)

A full-stack platform for German language learning. Teachers can manage courses and quizzes, students can track progress across CEFR levels (A1–C1), and center operators can submit requests for new learning centers through an admin approval workflow.

## Features

- **Interactive Quizzes & Assessments** — Auto-graded quizzes per lesson with score tracking and retake support
- **Multi-Level Curriculum** — Structured lessons across A1, A2, B1, B2, C1 levels
- **Progress Analytics** — Dashboard with quiz scores, completion rates, and learning history
- **Center Request Workflow** — Submit new learning center requests; admins approve or reject via a dedicated portal
- **Role-Based Access** — Student, teacher, and admin roles with guarded routes
- **i18n Multi-Language** — Full German/English support via i18next
- **3D Interactive Globe** — Visual homepage element built with Three.js / React Three Fiber
- **Responsive UI** — shadcn/ui components with Tailwind CSS

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Hono, tRPC v11, Drizzle ORM
- **Database:** MySQL
- **Auth:** JWT (jose) + bcrypt
- **i18n:** i18next (DE/EN)

## Getting Started

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your MySQL connection string (default: `mysql://root:root@localhost:3306/german_learning`).

### Push database schema

```bash
npm run db:push
```

### Seed admin user

```bash
npm run db:seed
```

### Start dev server

```bash
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

## Legal & Compliance

Terms of Service and Privacy Policy are available as in-app dialogs via the footer on every page, with full German and English translations.
