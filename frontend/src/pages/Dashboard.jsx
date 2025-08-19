import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { getBoards } from '../store/slices/boardsSlice'
import { openModal } from '../store/slices/uiSlice'
import CreateBoardModal from '../components/CreateBoardModal'
import axios from 'axios'

function Dashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { boards, isLoading } = useSelector((state) => state.boards)
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      dispatch(getBoards())
      loadAnalytics()
    }
  }, [user, dispatch])

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
      const response = await axios.get('/api/analytics/dashboard', config)
      setAnalytics(response.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-primary-100">
          Manage your projects and collaborate with your team
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              📋
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Boards</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsLoading ? '...' : analytics?.overview?.totalBoards || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              📝
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsLoading ? '...' : analytics?.overview?.totalTasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsLoading ? '...' : analytics?.overview?.completedTasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              ⚠️
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analyticsLoading ? '...' : analytics?.overview?.overdueTasks || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Completion Rate */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${analytics.overview.completionRate}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-4 text-2xl font-bold text-green-600">
                {analytics.overview.completionRate}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {analytics.overview.completedTasks} of {analytics.overview.totalTasks} tasks completed
            </p>
          </div>

          {/* Tasks by Priority */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Priority</h3>
            <div className="space-y-3">
              {analytics.tasksByPriority.map((item) => (
                <div key={item.priority} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                      item.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      item.priority === 'MEDIUM' ? 'bg-gray-100 text-gray-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Stats */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tasks</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Assigned to you</span>
                <span className="font-semibold">{analytics.overview.assignedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed by you</span>
                <span className="font-semibold">{analytics.overview.assignedCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Your completion rate</span>
                <span className="font-semibold text-green-600">
                  {analytics.overview.assignedTasks > 0
                    ? Math.round((analytics.overview.assignedCompleted / analytics.overview.assignedTasks) * 100)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Tasks by Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
            <div className="space-y-3">
              {analytics.tasksByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.status === 'DONE' ? 'bg-green-100 text-green-800' :
                      item.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'REVIEW' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Boards Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Boards</h2>
          <button
            onClick={() => dispatch(openModal('createBoard'))}
            className="btn btn-primary"
          >
            + Create Board
          </button>
        </div>

        {boards && boards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                to={`/board/${board.id}`}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: board.color }}
                  >
                    {board.title.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500">
                    {board.members?.length || 0} members
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  {board.title}
                </h3>
                
                {board.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {board.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No boards yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first board to start organizing your projects
            </p>
            <button
              onClick={() => dispatch(openModal('createBoard'))}
              className="btn btn-primary"
            >
              Create Your First Board
            </button>
          </div>
        )}
      </div>

      <CreateBoardModal />
    </div>
  )
}

export default Dashboard
