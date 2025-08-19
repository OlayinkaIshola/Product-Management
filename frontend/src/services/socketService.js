import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
    this.isConnected = false
  }

  connect(token) {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server')
      this.isConnected = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Board-related events
  joinBoard(boardId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-board', boardId)
    }
  }

  leaveBoard(boardId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-board', boardId)
    }
  }

  // Task-related events
  emitTaskCreated(taskData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('task-created', taskData)
    }
  }

  emitTaskUpdated(taskData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('task-updated', taskData)
    }
  }

  emitTaskDeleted(taskData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('task-deleted', taskData)
    }
  }

  emitTaskMoved(taskData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('task-moved', taskData)
    }
  }

  // Board-related events
  emitBoardUpdated(boardData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('board-updated', boardData)
    }
  }

  // User presence events
  emitUserJoined(userData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user-joined', userData)
    }
  }

  emitUserLeft(userData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user-left', userData)
    }
  }

  // Event listeners
  onTaskCreated(callback) {
    if (this.socket) {
      this.socket.on('task-created', callback)
    }
  }

  onTaskUpdated(callback) {
    if (this.socket) {
      this.socket.on('task-updated', callback)
    }
  }

  onTaskDeleted(callback) {
    if (this.socket) {
      this.socket.on('task-deleted', callback)
    }
  }

  onTaskMoved(callback) {
    if (this.socket) {
      this.socket.on('task-moved', callback)
    }
  }

  onBoardUpdated(callback) {
    if (this.socket) {
      this.socket.on('board-updated', callback)
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on('user-joined', callback)
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on('user-left', callback)
    }
  }

  onUserPresence(callback) {
    if (this.socket) {
      this.socket.on('user-presence', callback)
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected
  }
}

// Create a singleton instance
const socketService = new SocketService()

export default socketService
