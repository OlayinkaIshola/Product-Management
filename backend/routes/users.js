import express from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import { protect } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = express.Router()

// All routes are protected
router.use(protect)

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            ownedBoards: true,
            assignedTasks: true,
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put(
  '/profile',
  [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please include a valid email'),
    body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { name, email, avatar } = req.body
      const updateData = {}

      if (name) updateData.name = name
      if (email) {
        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: req.user.id },
          },
        })

        if (existingUser) {
          return res.status(400).json({ message: 'Email already in use' })
        }
        updateData.email = email
      }
      if (avatar) updateData.avatar = avatar

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          createdAt: true,
        },
      })

      res.json(updatedUser)
    } catch (error) {
      next(error)
    }
  }
)

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
router.put(
  '/password',
  [
    body('currentPassword').exists().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { currentPassword, newPassword } = req.body

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      })

      // Check current password
      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ message: 'Current password is incorrect' })
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(newPassword, salt)

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      })

      res.json({ message: 'Password updated successfully' })
    } catch (error) {
      next(error)
    }
  }
)

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query

    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' })
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ],
        NOT: { id: req.user.id }, // Exclude current user
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
      take: 10, // Limit results
    })

    res.json(users)
  } catch (error) {
    next(error)
  }
})

export default router
