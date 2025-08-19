import express from 'express'
import { body, validationResult } from 'express-validator'
import { protect } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = express.Router()

// All routes are protected
router.use(protect)

// @desc    Get all boards for user
// @route   GET /api/boards
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          {
            members: {
              some: {
                userId: req.user.id,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            lists: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    res.json(boards)
  } catch (error) {
    next(error)
  }
})

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Board title is required'),
    body('description').optional().trim(),
    body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
    body('isPrivate').optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { title, description, color, isPrivate } = req.body

      const board = await prisma.board.create({
        data: {
          title,
          description,
          color: color || '#3b82f6',
          isPrivate: isPrivate || false,
          ownerId: req.user.id,
          members: {
            create: {
              userId: req.user.id,
              role: 'OWNER',
            },
          },
          lists: {
            create: [
              { title: 'To Do', position: 0 },
              { title: 'In Progress', position: 1, color: '#f59e0b' },
              { title: 'Done', position: 2, color: '#10b981' },
            ],
          },
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
          lists: true,
        },
      })

      res.status(201).json(board)
    } catch (error) {
      next(error)
    }
  }
)

// @desc    Get single board
// @route   GET /api/boards/:id
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    const board = await prisma.board.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          {
            members: {
              some: {
                userId: req.user.id,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        lists: {
          orderBy: {
            position: 'asc',
          },
          include: {
            tasks: {
              orderBy: {
                position: 'asc',
              },
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
                creator: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                  },
                },
                labels: true,
                _count: {
                  select: {
                    comments: true,
                    attachments: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!board) {
      return res.status(404).json({ message: 'Board not found' })
    }

    res.json(board)
  } catch (error) {
    next(error)
  }
})

// @desc    Update board
// @route   PUT /api/boards/:id
// @access  Private
router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Board title cannot be empty'),
    body('description').optional().trim(),
    body('color').optional().isHexColor().withMessage('Color must be a valid hex color'),
    body('isPrivate').optional().isBoolean(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { id } = req.params
      const { title, description, color, isPrivate } = req.body

      // Check if user has permission to update board
      const board = await prisma.board.findFirst({
        where: {
          id,
          OR: [
            { ownerId: req.user.id },
            {
              members: {
                some: {
                  userId: req.user.id,
                  role: { in: ['OWNER', 'ADMIN'] },
                },
              },
            },
          ],
        },
      })

      if (!board) {
        return res.status(404).json({ message: 'Board not found or insufficient permissions' })
      }

      const updateData = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (color !== undefined) updateData.color = color
      if (isPrivate !== undefined) updateData.isPrivate = isPrivate

      const updatedBoard = await prisma.board.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                },
              },
            },
          },
        },
      })

      res.json(updatedBoard)
    } catch (error) {
      next(error)
    }
  }
)

// @desc    Delete board
// @route   DELETE /api/boards/:id
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    // Check if user is the owner of the board
    const board = await prisma.board.findFirst({
      where: {
        id,
        ownerId: req.user.id,
      },
    })

    if (!board) {
      return res.status(404).json({ message: 'Board not found or insufficient permissions' })
    }

    await prisma.board.delete({
      where: { id },
    })

    res.json({ message: 'Board deleted successfully', id })
  } catch (error) {
    next(error)
  }
})

export default router
