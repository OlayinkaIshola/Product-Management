import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  darkMode: false,
  sidebarOpen: true,
  loading: false,
  notifications: [],
  modals: {
    createBoard: false,
    createTask: false,
    editTask: false,
    deleteConfirm: false,
  },
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false
      })
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      })
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
  },
})

export const {
  toggleDarkMode,
  toggleSidebar,
  setLoading,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
} = uiSlice.actions

export default uiSlice.reducer
