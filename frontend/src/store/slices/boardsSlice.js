import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import boardService from '../../services/boardService'

const initialState = {
  boards: [],
  currentBoard: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Create new board
export const createBoard = createAsyncThunk(
  'boards/create',
  async (boardData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await boardService.createBoard(boardData, token)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get user boards
export const getBoards = createAsyncThunk(
  'boards/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await boardService.getBoards(token)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get single board
export const getBoard = createAsyncThunk(
  'boards/get',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await boardService.getBoard(id, token)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Delete board
export const deleteBoard = createAsyncThunk(
  'boards/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await boardService.deleteBoard(id, token)
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString()
      return thunkAPI.rejectWithValue(message)
    }
  }
)

export const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBoard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.boards.push(action.payload)
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getBoards.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBoards.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.boards = action.payload
      })
      .addCase(getBoards.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getBoard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getBoard.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.currentBoard = action.payload
      })
      .addCase(getBoard.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(deleteBoard.pending, (state) => {
        state.isLoading = true
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.boards = state.boards.filter(
          (board) => board.id !== action.payload.id
        )
      })
      .addCase(deleteBoard.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
  },
})

export const { reset } = boardsSlice.actions
export default boardsSlice.reducer
