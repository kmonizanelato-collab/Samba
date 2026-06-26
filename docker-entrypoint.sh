#!/bin/sh
set -e

echo "Aplicando schema do banco (prisma db push)..."
npx prisma db push --skip-generate

exec "$@"
