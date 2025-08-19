#!/bin/bash

# Project Management Tool Setup Script
echo "🚀 Setting up Project Management Tool..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

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
if npm install; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
if npm install; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
if npx prisma generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi
cd ..

echo "✅ Setup complete!"
echo ""
echo "🎉 Your Project Management Tool is ready!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up your database (PostgreSQL required)"
echo "2. Update backend/.env with your database URL"
echo "3. Run database migrations:"
echo "   cd backend && npx prisma migrate dev --name init"
echo "4. Seed the database:"
echo "   npx prisma db seed"
echo ""
echo "🚀 To start the application:"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - Backend: cd backend && npm run dev"
echo ""
echo "🌐 Access URLs:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:5000/api/health"
echo ""
echo "🔑 Default login credentials:"
echo "   Email: john@example.com"
echo "   Password: password123"
echo ""
echo "📖 For deployment instructions, see deploy.md"
