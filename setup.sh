#!/bin/bash

# Project Management Tool Setup Script
echo "🚀 Setting up Project Management Tool..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    exit 1
fi

# Create environment files
echo "📝 Creating environment files..."

# Backend environment
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
else
    echo "⚠️  backend/.env already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Setup database with Docker
echo "🐳 Starting database with Docker..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎉 Your Project Management Tool is ready!"
echo ""
echo "To start the application:"
echo "1. Start all services: docker-compose up"
echo "2. Or start individually:"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - Backend: cd backend && npm run dev"
echo ""
echo "Access the application at: http://localhost:3000"
echo "API documentation at: http://localhost:5000/api/health"
echo ""
echo "Default login credentials:"
echo "Email: john@example.com"
echo "Password: password123"
