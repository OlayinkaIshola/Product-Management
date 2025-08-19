import express from 'express'
import { protect } from '../middleware/auth.js'
import prisma from '../lib/prisma.js'

const router = express.Router()

// All routes are protected
router.use(protect)

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get user's boards
    const userBoards = await prisma.board.findMany({
      where: {
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
      select: { id: true },
    })

    const boardIds = userBoards.map(board => board.id)

    // Get total counts
    const [totalBoards, totalTasks, completedTasks, overdueTasks] = await Promise.all([
      prisma.board.count({
        where: {
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
      }),
      prisma.task.count({
        where: {
          boardId: { in: boardIds },
        },
      }),
      prisma.task.count({
        where: {
          boardId: { in: boardIds },
          status: 'DONE',
        },
      }),
      prisma.task.count({
        where: {
          boardId: { in: boardIds },
          dueDate: { lt: new Date() },
          status: { not: 'DONE' },
        },
      }),
    ])

    // Get tasks by priority
    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: {
        boardId: { in: boardIds },
      },
      _count: {
        id: true,
      },
    })

    // Get tasks by status
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: {
        boardId: { in: boardIds },
      },
      _count: {
        id: true,
      },
    })

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTasks = await prisma.task.findMany({
      where: {
        boardId: { in: boardIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        createdAt: true,
        completedAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Get user's assigned tasks
    const assignedTasks = await prisma.task.count({
      where: {
        assigneeId: userId,
        boardId: { in: boardIds },
      },
    })

    const assignedCompleted = await prisma.task.count({
      where: {
        assigneeId: userId,
        boardId: { in: boardIds },
        status: 'DONE',
      },
    })

    res.json({
      overview: {
        totalBoards,
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: Math.round(completionRate),
        assignedTasks,
        assignedCompleted,
      },
      tasksByPriority: tasksByPriority.map(item => ({
        priority: item.priority,
        count: item._count.id,
      })),
      tasksByStatus: tasksByStatus.map(item => ({
        status: item.status,
        count: item._count.id,
      })),
      recentActivity: recentTasks,
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Get board analytics
// @route   GET /api/analytics/board/:boardId
// @access  Private
router.get('/board/:boardId', async (req, res, next) => {
  try {
    const { boardId } = req.params
    const userId = req.user.id

    // Check if user has access to the board
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

    if (!board) {
      return res.status(404).json({ message: 'Board not found or access denied' })
    }

    // Get board statistics
    const [totalTasks, completedTasks, inProgressTasks, todoTasks] = await Promise.all([
      prisma.task.count({
        where: { boardId },
      }),
      prisma.task.count({
        where: { boardId, status: 'DONE' },
      }),
      prisma.task.count({
        where: { boardId, status: 'IN_PROGRESS' },
      }),
      prisma.task.count({
        where: { boardId, status: 'TODO' },
      }),
    ])

    // Get tasks by assignee
    const tasksByAssignee = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: { boardId },
      _count: {
        id: true,
      },
    })

    // Get assignee details
    const assigneeIds = tasksByAssignee
      .filter(item => item.assigneeId)
      .map(item => item.assigneeId)

    const assignees = await prisma.user.findMany({
      where: { id: { in: assigneeIds } },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    })

    const tasksByAssigneeWithDetails = tasksByAssignee.map(item => {
      const assignee = assignees.find(a => a.id === item.assigneeId)
      return {
        assignee: assignee || { name: 'Unassigned', id: null },
        count: item._count.id,
      }
    })

    // Get task completion over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const completionHistory = await prisma.task.findMany({
      where: {
        boardId,
        completedAt: { gte: thirtyDaysAgo },
      },
      select: {
        completedAt: true,
      },
      orderBy: {
        completedAt: 'asc',
      },
    })

    // Group by date
    const completionByDate = completionHistory.reduce((acc, task) => {
      const date = task.completedAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    res.json({
      overview: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      tasksByAssignee: tasksByAssigneeWithDetails,
      completionHistory: Object.entries(completionByDate).map(([date, count]) => ({
        date,
        count,
      })),
    })
  } catch (error) {
    next(error)
  }
})

// @desc    Get user productivity metrics
// @route   GET /api/analytics/productivity
// @access  Private
router.get('/productivity', async (req, res, next) => {
  try {
    const userId = req.user.id
    const { period = '30' } = req.query // days

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    // Get user's task completion in the period
    const completedTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        completedAt: { gte: daysAgo },
      },
      select: {
        completedAt: true,
        createdAt: true,
        priority: true,
        board: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // Calculate average completion time
    const completionTimes = completedTasks
      .filter(task => task.completedAt && task.createdAt)
      .map(task => {
        const created = new Date(task.createdAt)
        const completed = new Date(task.completedAt)
        return (completed - created) / (1000 * 60 * 60 * 24) // days
      })

    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0

    // Group by date for productivity chart
    const productivityByDate = completedTasks.reduce((acc, task) => {
      const date = task.completedAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {})

    // Get current assigned tasks
    const currentTasks = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
      },
    })

    res.json({
      summary: {
        tasksCompleted: completedTasks.length,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
        currentTasks,
        period: parseInt(period),
      },
      productivityChart: Object.entries(productivityByDate).map(([date, count]) => ({
        date,
        count,
      })),
      recentCompletions: completedTasks.slice(0, 10),
    })
  } catch (error) {
    next(error)
  }
})

export default router
