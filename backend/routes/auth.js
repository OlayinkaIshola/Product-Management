import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import prisma from '../lib/prisma.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  })
}

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { name, email, password } = req.body

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { email },
      })

      if (userExists) {
        return res.status(400).json({ message: 'User already exists' })
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      })

      if (user) {
        res.status(201).json({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user.id),
        })
      } else {
        res.status(400).json({ message: 'Invalid user data' })
      }
    } catch (error) {
      next(error)
    }
  }
)

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { email, password } = req.body

      // Check for user email
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user.id),
        })
      } else {
        res.status(400).json({ message: 'Invalid credentials' })
      }
    } catch (error) {
      next(error)
    }
  }
)

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.status(200).json(req.user)
})

export default router
