import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Import routes
import authRoutes from './routes/auth.js'
import boardRoutes from './routes/boards.js'
import taskRoutes from './routes/tasks.js'
import userRoutes from './routes/users.js'
import analyticsRoutes from './routes/analytics.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/users', userRoutes)
app.use('/api/analytics', analyticsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join board room
  socket.on('join-board', (boardId) => {
    socket.join(`board-${boardId}`)
    console.log(`User ${socket.id} joined board ${boardId}`)
  })

  // Leave board room
  socket.on('leave-board', (boardId) => {
    socket.leave(`board-${boardId}`)
    console.log(`User ${socket.id} left board ${boardId}`)
  })

  // Handle task updates
  socket.on('task-updated', (data) => {
    socket.to(`board-${data.boardId}`).emit('task-updated', data)
  })

  // Handle task creation
  socket.on('task-created', (data) => {
    socket.to(`board-${data.boardId}`).emit('task-created', data)
  })

  // Handle task deletion
  socket.on('task-deleted', (data) => {
    socket.to(`board-${data.boardId}`).emit('task-deleted', data)
  })

  // Handle board updates
  socket.on('board-updated', (data) => {
    socket.to(`board-${data.boardId}`).emit('board-updated', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
