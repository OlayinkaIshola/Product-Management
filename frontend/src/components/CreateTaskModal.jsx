import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createTask } from '../store/slices/tasksSlice'
import { closeModal } from '../store/slices/uiSlice'

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-gray-100 text-gray-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800' },
]

function CreateTaskModal({ listId, boardId }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    assigneeId: '',
  })

  const dispatch = useDispatch()
  const { isLoading } = useSelector((state) => state.tasks)
  const { modals } = useSelector((state) => state.ui)
  const { currentBoard } = useSelector((state) => state.boards)

  const handleSubmit = (e) => {
    e.preventDefault()
    const taskData = {
      ...formData,
      listId,
      boardId,
      dueDate: formData.dueDate || null,
      assigneeId: formData.assigneeId || null,
    }
    dispatch(createTask(taskData))
    handleClose()
  }

  const handleClose = () => {
    dispatch(closeModal('createTask'))
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: '',
      assigneeId: '',
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!modals.createTask) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
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
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input"
              placeholder="Enter task title"
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
              rows={4}
              placeholder="Enter task description (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="label">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label htmlFor="assigneeId" className="label">
              Assignee
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              value={formData.assigneeId}
              onChange={handleChange}
              className="input"
            >
              <option value="">Unassigned</option>
              {currentBoard?.members?.map((member) => (
                <option key={member.user.id} value={member.user.id}>
                  {member.user.name} ({member.user.email})
                </option>
              ))}
            </select>
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
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
