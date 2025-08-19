import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import taskService from '../../services/taskService'

const initialState = {
  tasks: [],
  lists: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
}

// Create new task
export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await taskService.createTask(taskData, token)
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

// Get tasks for a board
export const getTasks = createAsyncThunk(
  'tasks/getAll',
  async (boardId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await taskService.getTasks(boardId, token)
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

// Update task
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, taskData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await taskService.updateTask(id, taskData, token)
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

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token
      return await taskService.deleteTask(id, token)
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

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    reset: (state) => initialState,
    moveTask: (state, action) => {
      const { taskId, newListId, newPosition } = action.payload
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        task.listId = newListId
        task.position = newPosition
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.isLoading = true
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.tasks.push(action.payload)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.tasks = action.payload.tasks
        state.lists = action.payload.lists
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        const index = state.tasks.findIndex((task) => task.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false
        state.isSuccess = true
        state.tasks = state.tasks.filter((task) => task.id !== action.payload.id)
      })
  },
})

export const { reset, moveTask } = tasksSlice.actions
export default tasksSlice.reducer
