import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createBoard } from '../store/slices/boardsSlice'
import { closeModal } from '../store/slices/uiSlice'

const BOARD_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6b7280', // Gray
]

function CreateBoardModal() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: BOARD_COLORS[0],
    isPrivate: false,
  })

  const dispatch = useDispatch()
  const { isLoading } = useSelector((state) => state.boards)
  const { modals } = useSelector((state) => state.ui)

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(createBoard(formData))
    setFormData({
      title: '',
      description: '',
      color: BOARD_COLORS[0],
      isPrivate: false,
    })
  }

  const handleClose = () => {
    dispatch(closeModal('createBoard'))
    setFormData({
      title: '',
      description: '',
      color: BOARD_COLORS[0],
      isPrivate: false,
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (!modals.createBoard) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Board</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="label">
              Board Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter board title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input resize-none"
              rows={3}
              placeholder="Enter board description (optional)"
            />
          </div>

          <div>
            <label className="label">Board Color</label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {BOARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
              Make this board private
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBoardModal
