#!/bin/bash

echo "🌱 Starting database seeding in Docker environment..."

# Start the database if not running
echo "📦 Starting PostgreSQL database..."
docker compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run the seeder
echo "🌱 Running database seeder..."
docker compose exec app npx nest start --entryFile seed

echo "✅ Seeding completed!"
echo ""
echo "📋 Sample data created:"
echo "   • 12 users (3 doctors, 3 labs, 6 patients)"
echo "   • 8 lab orders with various statuses"
echo "   • 4 completed lab results"
echo "   • 5 audit log entries"
echo ""
echo "🔑 Default password for all users: StrongPass123!"
echo ""
echo "👥 Sample users:"
echo "   Doctors: dr.smith@doorkita.com, dr.johnson@doorkita.com, dr.williams@doorkita.com"
echo "   Labs: lab.central@doorkita.com, lab.specialized@doorkita.com, lab.urgent@doorkita.com"
echo "   Patients: john.doe@email.com, jane.smith@email.com, robert.wilson@email.com, etc."
