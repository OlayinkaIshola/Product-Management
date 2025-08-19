import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  })

  // Create demo board
  const board = await prisma.board.create({
    data: {
      title: 'Website Redesign Project',
      description: 'Complete redesign of the company website with modern UI/UX',
      color: '#3b82f6',
      ownerId: user1.id,
      members: {
        create: [
          {
            userId: user1.id,
            role: 'OWNER',
          },
          {
            userId: user2.id,
            role: 'MEMBER',
          },
        ],
      },
    },
  })

  // Create lists
  const todoList = await prisma.list.create({
    data: {
      title: 'To Do',
      position: 0,
      boardId: board.id,
    },
  })

  const inProgressList = await prisma.list.create({
    data: {
      title: 'In Progress',
      position: 1,
      color: '#f59e0b',
      boardId: board.id,
    },
  })

  const doneList = await prisma.list.create({
    data: {
      title: 'Done',
      position: 2,
      color: '#10b981',
      boardId: board.id,
    },
  })

  // Create labels
  const urgentLabel = await prisma.label.create({
    data: {
      name: 'Urgent',
      color: '#ef4444',
    },
  })

  const designLabel = await prisma.label.create({
    data: {
      name: 'Design',
      color: '#8b5cf6',
    },
  })

  const frontendLabel = await prisma.label.create({
    data: {
      name: 'Frontend',
      color: '#06b6d4',
    },
  })

  // Create demo tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Create wireframes for homepage',
        description: 'Design low-fidelity wireframes for the new homepage layout',
        position: 0,
        priority: 'HIGH',
        boardId: board.id,
        listId: todoList.id,
        creatorId: user1.id,
        assigneeId: user2.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: 'Set up development environment',
        description: 'Configure React, Tailwind, and other necessary tools',
        position: 1,
        priority: 'MEDIUM',
        boardId: board.id,
        listId: todoList.id,
        creatorId: user1.id,
        assigneeId: user1.id,
      },
      {
        title: 'Design system components',
        description: 'Create reusable UI components following the design system',
        position: 0,
        priority: 'HIGH',
        boardId: board.id,
        listId: inProgressList.id,
        creatorId: user2.id,
        assigneeId: user2.id,
      },
      {
        title: 'Research competitor websites',
        description: 'Analyze competitor websites for inspiration and best practices',
        position: 0,
        priority: 'LOW',
        boardId: board.id,
        listId: doneList.id,
        creatorId: user1.id,
        assigneeId: user1.id,
        status: 'DONE',
        completedAt: new Date(),
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
