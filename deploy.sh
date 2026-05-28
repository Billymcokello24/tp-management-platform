#!/bin/bash
# Deployment script for TMU Teaching Practice Platform

# Exit immediately if a command exits with a non-zero status
set -e

echo "================================================"
echo "🚀 Starting TMU Platform Deployment..."
echo "================================================"

# 1. Pull latest changes
echo "📦 Pulling latest changes from Git..."
git pull origin main

# 2. Install dependencies (using ci for strict lockfile adherence)
echo "📦 Installing Node dependencies..."
npm ci

# 3. Prisma Schema & DB Migrations
echo "🗄️ Generating Prisma Client and running migrations..."
npx prisma generate
npx prisma migrate deploy

# 4. Build Next.js App
echo "🏗️ Building the Next.js production bundle..."
npm run build

# 5. Restart PM2 Process
# Make sure your PM2 process is named "tmu-platform". If not, change the name below.
echo "🔄 Restarting the PM2 process..."
pm2 restart tmu-platform

echo "================================================"
echo "✅ Deployment completed successfully!"
echo "================================================"
