import api from '../config/api'

const API_URL = '/api/tasks/'

// Create new task
const createTask = async (taskData, token) => {
  const response = await api.post(API_URL, taskData)
  return response.data
}

// Get tasks for a board
const getTasks = async (boardId, token) => {
  const response = await api.get(API_URL + `board/${boardId}`)
  return response.data
}

// Update task
const updateTask = async (taskId, taskData, token) => {
  const response = await api.put(API_URL + taskId, taskData)
  return response.data
}

// Delete task
const deleteTask = async (taskId, token) => {
  const response = await api.delete(API_URL + taskId)
  return response.data
}

const taskService = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
}

export default taskService
