import axios from 'axios'

// Configure axios base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const API_URL = '/api/tasks/'

// Create new task
const createTask = async (taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(API_URL, taskData, config)
  return response.data
}

// Get tasks for a board
const getTasks = async (boardId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.get(API_URL + `board/${boardId}`, config)
  return response.data
}

// Update task
const updateTask = async (taskId, taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.put(API_URL + taskId, taskData, config)
  return response.data
}

// Delete task
const deleteTask = async (taskId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.delete(API_URL + taskId, config)
  return response.data
}

const taskService = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
}

export default taskService
