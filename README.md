# TMU Teaching Practice Management Platform

A comprehensive Progressive Web App (PWA) built for Tom Mboya University to streamline and manage the entire Teaching Practice workflow for administrators, lecturers, and student teachers.

## Features

- **Progressive Web App:** Fully installable on Desktop and Android devices with offline caching via Service Workers.
- **Smart Allocations:** Automated assignment of lecturers to student teachers.
- **Digital Assessments:** Built-in grading rubrics and high-fidelity PDF report generation.
- **Real-Time Feedback:** Portfolio and lesson plan submission system with instant feedback.
- **Institutional Branding:** Sleek, responsive, mobile-first design using the official TMU colors (Maroon, Blue, Gold).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS & shadcn/ui
- **Icons:** Lucide React

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure your `.env` with a PostgreSQL URL and NextAuth secret
4. Run migrations with `npx prisma migrate dev`
5. Start the development server with `npm run dev`

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

Check the included `deploy.sh` script for streamlined deployment to a PM2/Nginx Ubuntu VPS environment.
