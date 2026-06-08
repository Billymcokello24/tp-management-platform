#!/bin/sh
set -e

echo "Deploying Prisma Migrations..."
npx prisma migrate deploy

echo "Starting Next.js Server..."
exec "$@"
