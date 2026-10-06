# TeamForge
**Forge the right team. Build something great.**

TeamForge is a modern platform designed to help students, developers, and creators discover projects, assess skill gaps, and form the perfect team. It replaces chaotic Discord channels and spreadsheets with a centralized, intelligent team-building command center.

## Key Features
- **Smart Matching System:** Discovers members who complement your team's skill gaps.
- **Skill Gap Analysis:** Visually identifies what skills your project is missing.
- **Project Discovery:** Browse projects filtering by needed skills and department.
- **Team Command Center:** Unified dashboard for invitations, connections, and activity.
- **Real-Time Team Chat:** Built-in messaging for coordinated communication.
- **Mobile Optimized:** Fully responsive across all devices with smooth UI/UX interactions.

## Technology Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Shadcn UI
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Authentication:** Custom JWT Session Management

## Local Development Setup

1. **Clone the repository**
   \\\ash
   git clone <your-repo-url>
   cd teamforge
   \\\

2. **Install dependencies**
   \\\ash
   npm install
   \\\

3. **Environment Setup**
   Copy the example environment file and configure your credentials:
   \\\ash
   cp .env.example .env
   \\\
   Update \DATABASE_URL\ to your PostgreSQL connection string and set a secure \SESSION_SECRET\.

4. **Database Initialization**
   Push the schema to your database:
   \\\ash
   npx prisma db push
   \\\

5. **Start Development Server**
   \\\ash
   npm run dev
   \\\

## Production Deployment
TeamForge is natively designed for deployment on Vercel. 
Ensure your \DATABASE_URL\ and \SESSION_SECRET\ are added to your hosting provider's environment variables. During the build step, ensure Prisma runs \
px prisma generate\ and the database schema is pushed.
