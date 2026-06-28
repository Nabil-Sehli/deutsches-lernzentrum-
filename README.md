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

## Quick Start (Local Testing)

### Prerequisites

- **Node.js** 20+
- **Docker Desktop** (for MySQL)
- **npm**

### 1. Clone & install

```bash
git clone https://github.com/Nabil-Sehli/deutsches-lernzentrum-.git
cd deutsches-lernzentrum-
npm install
```

### 2. Start MySQL with Docker

```bash
docker run -d --name mysql-lernzentrum \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=german_learning \
  -p 3306:3306 \
  mysql:8
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in at minimum:

```
APP_SECRET=any-random-string-here
DATABASE_URL=mysql://root:root@localhost:3306/german_learning
```

S3 and SendGrid can be left blank — image uploads and email verification will be skipped.

### 4. Push database schema & seed

```bash
npm run db:push
npm run db:seed
```

This creates all tables and a default admin account.

### 5. Start the dev server

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### Default accounts

After seeding, the following accounts are available (password for all: `password123`):

| Email | Role | Description |
|-------|------|-------------|
| `admin@example.com` | Admin | Platform admin — approves center requests |
| `teacher@example.com` | Teacher | Runs a center (Berlin German School) |
| `dev-teacher@dev.local` | Teacher | Runs a second center (Dev Test Center) |
| `dev-student@dev.local` | Student | Already assigned to a center |
| `anna@example.com` | Student | Needs to join a center via invite code |
| `ben@example.com` | Student | Needs to join a center via invite code |
| `clara@example.com` | Student | Needs to join a center via invite code |

### Testing Flow

#### For a new teacher signing up:

1. **Sign up** at `/signup` with role "teacher"
2. Go to **Dashboard** and click **"Request Center"** — fill in center details
3. Log out, then log in as **`admin@example.com`** (password: `password123`)
4. Go to **Admin** panel and find the **Center Requests** tab
5. **Approve** the pending request
6. The teacher now has a fully active center

#### For a new student joining a center:

1. **Sign up** at `/signup` with role "student"
2. Go to **Dashboard** and enter an **invite code** from the center
3. Once accepted, the student's lessons and assignments appear
4. The teacher can generate invite codes in **Admin → Invites tab**

#### Generating invite codes (teacher):

1. Log in as a teacher
2. Go to **Admin → Invites**
3. Click **Generate Code** — share this code with students

> **Note:** Image uploads and email verification require S3 and SendGrid configuration. For local testing, these features are automatically disabled when the env vars are missing.

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
