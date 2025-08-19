import express from 'express'
import { body, validationResult } from 'express-validator'
import { protect } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = express.Router()

// All routes are protected
router.use(protect)

// Helper function to check board access
const checkBoardAccess = async (boardId, userId) => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      ],
    },
  })
  return board
}

// @desc    Get all tasks for a board
// @route   GET /api/tasks/board/:boardId
// @access  Private
router.get('/board/:boardId', async (req, res, next) => {
  try {
    const { boardId } = req.params

    // Check if user has access to the board
    const board = await checkBoardAccess(boardId, req.user.id)
    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' })
    }

    const lists = await prisma.list.findMany({
      where: { boardId },
      include: {
        tasks: {
          orderBy: { position: 'asc' },
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
      orderBy: { position: 'asc' },
    })

    const tasks = lists.flatMap(list => list.tasks)

    res.json({ lists, tasks })
  } catch (error) {
    next(error)
  }
})

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1 }).withMessage('Task title is required'),
    body('description').optional().trim(),
    body('listId').isString().withMessage('List ID is required'),
    body('boardId').isString().withMessage('Board ID is required'),
    body('assigneeId').optional().isString(),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    body('dueDate').optional().isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { title, description, listId, boardId, assigneeId, priority, dueDate } = req.body

      // Check if user has access to the board
      const board = await checkBoardAccess(boardId, req.user.id)
      if (!board) {
        return res.status(404).json({ message: 'Board not found or access denied' })
      }

      // Verify list belongs to board
      const list = await prisma.list.findFirst({
        where: { id: listId, boardId },
      })
      if (!list) {
        return res.status(404).json({ message: 'List not found' })
      }

      // Get the next position for the task
      const lastTask = await prisma.task.findFirst({
        where: { listId },
        orderBy: { position: 'desc' },
      })
      const position = lastTask ? lastTask.position + 1 : 0

      // Verify assignee if provided
      if (assigneeId) {
        const assignee = await prisma.user.findUnique({
          where: { id: assigneeId },
        })
        if (!assignee) {
          return res.status(404).json({ message: 'Assignee not found' })
        }
      }

      const task = await prisma.task.create({
        data: {
          title,
          description,
          listId,
          boardId,
          creatorId: req.user.id,
          assigneeId,
          priority: priority || 'MEDIUM',
          dueDate: dueDate ? new Date(dueDate) : null,
          position,
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
      })

      res.status(201).json(task)
    } catch (error) {
      next(error)
    }
  }
)

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1 }).withMessage('Task title cannot be empty'),
    body('description').optional().trim(),
    body('listId').optional().isString(),
    body('assigneeId').optional().isString(),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
    body('dueDate').optional().isISO8601(),
    body('position').optional().isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { id } = req.params
      const { title, description, listId, assigneeId, priority, status, dueDate, position } = req.body

      // Get current task and check access
      const currentTask = await prisma.task.findUnique({
        where: { id },
        include: { board: true },
      })

      if (!currentTask) {
        return res.status(404).json({ message: 'Task not found' })
      }

      // Check if user has access to the board
      const board = await checkBoardAccess(currentTask.boardId, req.user.id)
      if (!board) {
        return res.status(404).json({ message: 'Board not found or access denied' })
      }

      const updateData = {}
      if (title !== undefined) updateData.title = title
      if (description !== undefined) updateData.description = description
      if (assigneeId !== undefined) updateData.assigneeId = assigneeId
      if (priority !== undefined) updateData.priority = priority
      if (status !== undefined) {
        updateData.status = status
        if (status === 'DONE' && !currentTask.completedAt) {
          updateData.completedAt = new Date()
        } else if (status !== 'DONE' && currentTask.completedAt) {
          updateData.completedAt = null
        }
      }
      if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
      if (position !== undefined) updateData.position = position
      if (listId !== undefined) updateData.listId = listId

      const updatedTask = await prisma.task.update({
        where: { id },
        data: updateData,
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
      })

      res.json(updatedTask)
    } catch (error) {
      next(error)
    }
  }
)

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params

    // Get current task and check access
    const task = await prisma.task.findUnique({
      where: { id },
      include: { board: true },
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Check if user has access to the board
    const board = await checkBoardAccess(task.boardId, req.user.id)
    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' })
    }

    await prisma.task.delete({
      where: { id },
    })

    res.json({ message: 'Task deleted successfully', id })
  } catch (error) {
    next(error)
  }
})

// @desc    Move task to different list/position
// @route   PUT /api/tasks/:id/move
// @access  Private
router.put(
  '/:id/move',
  [
    body('listId').isString().withMessage('List ID is required'),
    body('position').isInt({ min: 0 }).withMessage('Position must be a non-negative integer'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg })
      }

      const { id } = req.params
      const { listId, position } = req.body

      // Get current task and check access
      const task = await prisma.task.findUnique({
        where: { id },
        include: { board: true },
      })

      if (!task) {
        return res.status(404).json({ message: 'Task not found' })
      }

      // Check if user has access to the board
      const board = await checkBoardAccess(task.boardId, req.user.id)
      if (!board) {
        return res.status(404).json({ message: 'Board not found or access denied' })
      }

      // Verify target list belongs to the same board
      const targetList = await prisma.list.findFirst({
        where: { id: listId, boardId: task.boardId },
      })
      if (!targetList) {
        return res.status(404).json({ message: 'Target list not found' })
      }

      // Update task position and list
      const updatedTask = await prisma.task.update({
        where: { id },
        data: {
          listId,
          position,
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
        },
      })

      res.json(updatedTask)
    } catch (error) {
      next(error)
    }
  }
)

export default router
