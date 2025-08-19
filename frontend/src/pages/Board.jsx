import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { getBoard } from '../store/slices/boardsSlice'
import { getTasks, updateTask, moveTask } from '../store/slices/tasksSlice'
import { openModal } from '../store/slices/uiSlice'
import CreateTaskModal from '../components/CreateTaskModal'
import socketService from '../services/socketService'

function Board() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [selectedListId, setSelectedListId] = useState(null)

  const { currentBoard, isLoading, isError, message } = useSelector((state) => state.boards)
  const { tasks, lists } = useSelector((state) => state.tasks)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (id) {
      dispatch(getBoard(id))
      dispatch(getTasks(id))
    }
  }, [id, dispatch])

  useEffect(() => {
    if (isError) {
      console.error(message)
      navigate('/')
    }
  }, [isError, message, navigate])

  // Socket.io real-time updates
  useEffect(() => {
    if (id && user) {
      // Connect to socket if not already connected
      if (!socketService.getConnectionStatus()) {
        socketService.connect(user.token)
      }

      // Join board room
      socketService.joinBoard(id)

      // Listen for real-time updates
      const handleTaskCreated = (taskData) => {
        if (taskData.boardId === id) {
          dispatch(getTasks(id)) // Refresh tasks
        }
      }

      const handleTaskUpdated = (taskData) => {
        if (taskData.boardId === id) {
          dispatch(getTasks(id)) // Refresh tasks
        }
      }

      const handleTaskDeleted = (taskData) => {
        if (taskData.boardId === id) {
          dispatch(getTasks(id)) // Refresh tasks
        }
      }

      const handleTaskMoved = (taskData) => {
        if (taskData.boardId === id) {
          // Update task position locally for immediate feedback
          dispatch(moveTask({
            taskId: taskData.taskId,
            newListId: taskData.listId,
            newPosition: taskData.position
          }))
        }
      }

      const handleBoardUpdated = (boardData) => {
        if (boardData.id === id) {
          dispatch(getBoard(id)) // Refresh board
        }
      }

      // Set up event listeners
      socketService.onTaskCreated(handleTaskCreated)
      socketService.onTaskUpdated(handleTaskUpdated)
      socketService.onTaskDeleted(handleTaskDeleted)
      socketService.onTaskMoved(handleTaskMoved)
      socketService.onBoardUpdated(handleBoardUpdated)

      // Cleanup on unmount
      return () => {
        socketService.leaveBoard(id)
        socketService.off('task-created', handleTaskCreated)
        socketService.off('task-updated', handleTaskUpdated)
        socketService.off('task-deleted', handleTaskDeleted)
        socketService.off('task-moved', handleTaskMoved)
        socketService.off('board-updated', handleBoardUpdated)
      }
    }
  }, [id, user, dispatch])

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    const task = tasks.find(t => t.id === draggableId)
    if (!task) return

    // Optimistic update for immediate feedback
    dispatch(moveTask({
      taskId: draggableId,
      newListId: destination.droppableId,
      newPosition: destination.index
    }))

    // Update task with new list and position
    dispatch(updateTask({
      id: draggableId,
      taskData: {
        listId: destination.droppableId,
        position: destination.index,
      }
    }))

    // Emit real-time update
    socketService.emitTaskMoved({
      taskId: draggableId,
      listId: destination.droppableId,
      position: destination.index,
      boardId: id
    })
  }

  const handleCreateTask = (listId) => {
    setSelectedListId(listId)
    dispatch(openModal('createTask'))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!currentBoard) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Board not found
        </h3>
        <p className="text-gray-600 mb-6">
          The board you're looking for doesn't exist or you don't have access to it.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: currentBoard.color }}
            >
              {currentBoard.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentBoard.title}</h1>
              {currentBoard.description && (
                <p className="text-gray-600">{currentBoard.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Board Members */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Members:</span>
              <div className="flex -space-x-2">
                {currentBoard.members?.slice(0, 5).map((member) => (
                  <div
                    key={member.id}
                    className="relative"
                    title={member.user.name}
                  >
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={member.user.name}
                        className="w-8 h-8 rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                {currentBoard.members?.length > 5 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    +{currentBoard.members.length - 5}
                  </div>
                )}
              </div>
            </div>

            {/* Board Actions */}
            <div className="flex items-center space-x-2">
              <button className="btn btn-secondary text-sm">
                Invite
              </button>
              <button className="btn btn-secondary text-sm">
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="px-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-6 overflow-x-auto pb-6">
            {currentBoard.lists?.map((list) => {
              const listTasks = tasks.filter(task => task.listId === list.id)

              return (
                <div key={list.id} className="flex-shrink-0 w-80">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">{list.title}</h3>
                      <span className="text-sm text-gray-500">
                        {listTasks.length}
                      </span>
                    </div>

                    <Droppable droppableId={list.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[100px] ${
                            snapshot.isDraggingOver ? 'bg-blue-50' : ''
                          }`}
                        >
                          {listTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                    snapshot.isDragging ? 'rotate-3 shadow-lg' : ''
                                  }`}
                                >
                                  <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>

                                  {task.description && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      {task.priority !== 'MEDIUM' && (
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                          task.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {task.priority}
                                        </span>
                                      )}

                                      {task.dueDate && (
                                        <span className="text-xs text-gray-500">
                                          Due {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>

                                    {task.assignee && (
                                      <div className="flex items-center space-x-1">
                                        {task.assignee.avatar ? (
                                          <img
                                            src={task.assignee.avatar}
                                            alt={task.assignee.name}
                                            className="w-6 h-6 rounded-full"
                                            title={task.assignee.name}
                                          />
                                        ) : (
                                          <div
                                            className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium"
                                            title={task.assignee.name}
                                          >
                                            {task.assignee.name.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {(task._count?.comments > 0 || task._count?.attachments > 0) && (
                                    <div className="flex items-center space-x-3 mt-2 pt-2 border-t border-gray-100">
                                      {task._count.comments > 0 && (
                                        <span className="text-xs text-gray-500 flex items-center">
                                          💬 {task._count.comments}
                                        </span>
                                      )}
                                      {task._count.attachments > 0 && (
                                        <span className="text-xs text-gray-500 flex items-center">
                                          📎 {task._count.attachments}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {/* Add Task Button */}
                    <button
                      onClick={() => handleCreateTask(list.id)}
                      className="w-full mt-3 p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                    >
                      + Add a task
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Add List Button */}
            <div className="flex-shrink-0 w-80">
              <button className="w-full h-32 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center text-gray-600 hover:text-gray-900">
                + Add another list
              </button>
            </div>
          </div>
        </DragDropContext>
      </div>

      <CreateTaskModal listId={selectedListId} boardId={id} />
    </div>
  )
}

export default Board
