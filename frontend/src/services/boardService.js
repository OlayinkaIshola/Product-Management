import api from '../config/api'

const API_URL = '/api/boards/'

// Create new board
const createBoard = async (boardData, token) => {
  const response = await api.post(API_URL, boardData)
  return response.data
}

// Get user boards
const getBoards = async (token) => {
  const response = await api.get(API_URL)
  return response.data
}

// Get single board
const getBoard = async (boardId, token) => {
  const response = await api.get(API_URL + boardId)
  return response.data
}

// Update board
const updateBoard = async (boardId, boardData, token) => {
  const response = await api.put(API_URL + boardId, boardData)
  return response.data
}

// Delete board
const deleteBoard = async (boardId, token) => {
  const response = await api.delete(API_URL + boardId)
  return response.data
}

const boardService = {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
}

export default boardService
