import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import boardsReducer from './slices/boardsSlice'
import tasksReducer from './slices/tasksSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    tasks: tasksReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
