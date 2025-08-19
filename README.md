# Project Management Tool (Trello Clone)

A comprehensive, full-featured project management application built with modern web technologies. This Trello-style tool includes real-time collaboration, analytics, and a beautiful responsive interface.

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with JWT
- Profile management with avatar support
- Secure password change functionality
- Protected routes and authorization

### 📋 Board & Project Management
- Create and manage multiple boards
- Customizable board colors and descriptions
- Team collaboration with member invitations
- Role-based permissions (Owner, Admin, Member, Viewer)

### 📝 Advanced Task Management
- Create, edit, and delete tasks
- Drag-and-drop functionality between lists
- Task priorities (Low, Medium, High, Urgent)
- Due dates and completion tracking
- Task assignments to team members
- Comments and attachments support

### 🔄 Real-Time Collaboration
- Live updates using Socket.io
- Real-time task movements
- User presence indicators
- Instant synchronization across all users

### 📊 Analytics & Dashboard
- Comprehensive dashboard with statistics
- Task completion rates and charts
- User productivity metrics
- Board-specific analytics
- Visual progress tracking

### 🎨 Modern UI/UX
- Responsive design for all devices
- Dark mode support
- Beautiful animations and transitions
- Intuitive drag-and-drop interface
- Loading states and error handling

## Tech Stack

### Frontend
- React 18 with Vite
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- React Beautiful DnD for drag-and-drop
- Socket.io client for real-time updates

### Backend
- Node.js with Express
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Socket.io for real-time features
- Helmet for security

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd project-management-tool

# Make setup script executable
chmod +x setup.sh

# Run automated setup
./setup.sh

# Start the application
docker-compose up
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Docker & Docker Compose (optional)

#### Installation Steps

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd project-management-tool

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

2. **Environment Configuration**
```bash
# Copy environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your settings:
# DATABASE_URL="postgresql://username:password@localhost:5432/project_management_db"
# JWT_SECRET="your-super-secret-jwt-key"
```

3. **Database Setup**
```bash
# Start PostgreSQL (or use Docker)
docker run --name pm-postgres -e POSTGRES_DB=project_management_db -e POSTGRES_PASSWORD=password123 -p 5432:5432 -d postgres:15

# Run migrations and seed data
cd backend
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database Admin**: `npx prisma studio` (from backend directory)

### 🔑 Default Login Credentials

```
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123
```

## Project Structure

```
project-management-tool/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── services/       # API service functions
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── controllers/        # Route controllers
│   ├── lib/               # Database and utilities
│   ├── prisma/            # Database schema and migrations
│   └── package.json
└── README.md
```

## 🐳 Docker Deployment

### Production Deployment with Docker

```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:password123@postgres:5432/project_management_db"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRE="30d"
NODE_ENV="production"
PORT=5000
CLIENT_URL="http://localhost:3000"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

#### Frontend (.env)
```env
REACT_APP_SERVER_URL="http://localhost:5000"
```

## 🛠️ Development

### Available Scripts

```bash
# Root level
npm run install:all      # Install all dependencies
npm run dev:frontend     # Start frontend dev server
npm run dev:backend      # Start backend dev server
npm run build:frontend   # Build frontend for production

# Backend specific
cd backend
npm run dev             # Start development server
npm run start           # Start production server
npm run migrate         # Run database migrations
npm run generate        # Generate Prisma client
npm run studio          # Open Prisma Studio

# Frontend specific
cd frontend
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📁 Project Structure

```
project-management-tool/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store and slices
│   │   ├── services/       # API and Socket.io services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   ├── lib/               # Database and utilities
│   ├── prisma/            # Database schema and migrations
│   └── package.json
├── docker-compose.yml       # Docker services configuration
├── setup.sh                # Automated setup script
└── README.md
```

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Board Endpoints
- `GET /api/boards` - Get user boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get single board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Task Endpoints
- `GET /api/tasks/board/:boardId` - Get board tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/move` - Move task

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/board/:boardId` - Board analytics
- `GET /api/analytics/productivity` - User productivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Node.js, and PostgreSQL
- UI components styled with Tailwind CSS
- Real-time features powered by Socket.io
- Database management with Prisma ORM
- Drag and drop functionality by React Beautiful DnD

---

**Happy Project Managing! 🎉**
