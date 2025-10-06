import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Inbox,
  Calendar,
  CheckCircle,
  X,
  LogOut,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tasksApi, type FrontendTask } from '../lib/tasks';

type ViewType = 'Inbox' | 'Today' | 'Completed';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: { name: string; priority: 'high' | 'medium' | 'low'; dueDate: string }) => void;
}

interface EditTaskModalProps {
  isOpen: boolean;
  task: FrontendTask | null;
  onClose: () => void;
  onSubmit: (taskId: string, task: { name: string; priority: 'high' | 'medium' | 'low'; dueDate: string }) => void;
  onDelete: (taskId: string) => void;
}

const CreateTaskModal = ({ isOpen, onClose, onSubmit }: CreateTaskModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
          onSubmit({
              name: formData.name.trim(),
              priority: formData.priority,
              dueDate: formData.dueDate
          });
        setFormData({
          name: '',
          priority: 'medium',
          dueDate: new Date().toISOString().split('T')[0]
        });
        onClose();
      } catch (error) {
        console.error('Failed to create task:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Finish project proposal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditTaskModal = ({ isOpen, task, onClose, onSubmit, onDelete }: EditTaskModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        priority: task.priority,
        dueDate: task.dueDate
      });
      setShowDeleteConfirm(false);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (task && formData.name.trim() && !isSubmitting && !isDeleting) {
      setIsSubmitting(true);
      try {
        await onSubmit(task.id, {
          name: formData.name.trim(),
          priority: formData.priority,
          dueDate: formData.dueDate
        });
        onClose();
      } catch (error) {
        console.error('Failed to update task:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDelete = async () => {
    if (task && !isDeleting && !isSubmitting) {
      setIsDeleting(true);
      try {
        await onDelete(task.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete task:', error);
      } finally {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Finish project proposal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting || isDeleting}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting || isDeleting}
              />
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 mb-3">Are you sure you want to delete this task? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Task'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
                disabled={isSubmitting || isDeleting}
                title="Delete task"
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={isSubmitting || isDeleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export const TodoDashboard = () => {
  const { user, logout, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedView, setSelectedView] = useState<ViewType>('Inbox');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<FrontendTask | null>(null);
  const [tasks, setTasks] = useState<FrontendTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // AuthContextの初期化が完了したらタスクを読み込む
  useEffect(() => {
    if (isInitializing) {
      return;
    }

    if (user) {
      loadTasks();
    } else {
      setLoading(false);
    }
  }, [user, isInitializing]);

  const loadTasks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const fetchedTasks = await tasksApi.getTasks();
      setTasks(fetchedTasks);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: { name: string; priority: 'high' | 'medium' | 'low'; dueDate: string }) => {
    try {
      setError(null);
      await tasksApi.createTask({
        name: taskData.name,
        priority: taskData.priority,
        dueDate: taskData.dueDate
      });
      await loadTasks(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
      throw error;
    }
  };

  const handleEditTask = async (taskId: string, taskData: { name: string; priority: 'high' | 'medium' | 'low'; dueDate: string }) => {
    try {
      setError(null);
      await tasksApi.updateTask(taskId, {
        name: taskData.name,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
      });
      await loadTasks(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setError(null);
      await tasksApi.deleteTask(taskId);
      await loadTasks(false);
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task. Please try again.');
      throw error;
    }
  };

  const openEditModal = (task: FrontendTask) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';

    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await tasksApi.updateTask(taskId, { ...task, status: newStatus });
    } catch (error) {
      console.error('Failed to toggle task:', error);
      setError('Failed to update task status.');
      setTasks(prevTasks =>
        prevTasks.map(t =>
          t.id === taskId ? { ...t, status: task.status } : t
        )
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleRefresh = () => {
    loadTasks();
  };

  const getFilteredTasks = () => {
    let filteredTasks = tasks;

    if (searchQuery.trim()) {
      filteredTasks = filteredTasks.filter(task =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (selectedView) {
      case 'Completed':
        return filteredTasks.filter(task => task.status === 'Completed');
      case 'Today':
        const today = new Date().toISOString().split('T')[0];
        return filteredTasks.filter(task =>
          task.status !== 'Completed' && task.dueDate === today
        );
      default:
        return filteredTasks.filter(task => task.status !== 'Completed');
    }
  };

  const groupTasksByPriority = (tasksToGroup: FrontendTask[]) => {
    return {
      high: tasksToGroup.filter(task => task.priority === 'high'),
      medium: tasksToGroup.filter(task => task.priority === 'medium'),
      low: tasksToGroup.filter(task => task.priority === 'low')
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDueDate = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dueDate === today) return 'Today';
    if (dueDate === tomorrowStr) return 'Tomorrow';
    if (dueDate < today) return 'Overdue';

    const date = new Date(dueDate);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDueDateColor = (dueDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dueDate < today) return 'text-red-600';
    if (dueDate === today) return 'text-orange-600';
    return 'text-gray-600';
  };

  const filteredTasks = getFilteredTasks();
  const groupedTasks = selectedView === 'Completed' ? null : groupTasksByPriority(filteredTasks);

  const sidebarItems = [
    {
      name: 'Inbox' as ViewType,
      icon: Inbox,
      count: tasks.filter(t => t.status !== 'Completed').length
    },
    {
      name: 'Today' as ViewType,
      icon: Calendar,
      count: tasks.filter(t =>
        t.status !== 'Completed' &&
        t.dueDate === new Date().toISOString().split('T')[0]
      ).length
    },
    {
      name: 'Completed' as ViewType,
      icon: CheckCircle,
      count: tasks.filter(t => t.status === 'Completed').length
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">TaskMaster</h1>
            </div>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Refresh tasks"
                disabled={loading}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                New Task
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-64 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedView(item.name)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${selectedView === item.name
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <item.icon size={18} className="mr-3" />
                <span className="flex-1 font-medium">{item.name}</span>
                {item.count > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${selectedView === item.name
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-600'
                    }`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}

            {lastRefresh && (
              <div className="pt-6 px-4 text-xs text-gray-500">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedView}</h2>
              <p className="text-gray-600">
                {filteredTasks.length > 0
                  ? `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`
                  : 'No tasks'
                }
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            )}

            {!loading && (
              <div className="space-y-6">
                {selectedView === 'Completed' ? (
                  <div className="space-y-3">
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => openEditModal(task)}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTaskCompletion(task.id);
                              }}
                              className="mt-1"
                            >
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </button>

                            <div className="flex-1">
                              <h4 className="font-medium line-through text-gray-500">
                                {task.name}
                              </h4>
                              <p className="text-sm text-gray-400 mt-1">
                                Completed • Due {formatDueDate(task.dueDate)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No completed tasks yet</h3>
                        <p className="text-gray-600">Complete some tasks to see them here!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {groupedTasks && Object.entries(groupedTasks).map(([priority, priorityTasks]) => {
                      if (priorityTasks.length === 0) return null;

                      return (
                        <div key={priority}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize flex items-center">
                            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${priority === 'high' ? 'bg-red-500' :
                              priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}></span>
                            {priority} Priority
                            <span className="ml-2 text-sm text-gray-500 font-normal">
                              ({priorityTasks.length})
                            </span>
                          </h3>
                          <div className="space-y-3">
                            {priorityTasks.map((task) => (
                              <div
                                key={task.id}
                                className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => openEditModal(task)}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskCompletion(task.id);
                                    }}
                                    className="mt-1"
                                  >
                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-blue-400 flex items-center justify-center">
                                    </div>
                                  </button>

                                  <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-medium text-gray-900 flex-1">
                                        {task.name}
                                      </h4>
                                      <span className={`ml-3 px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                      <p className={`text-sm ${getDueDateColor(task.dueDate)}`}>
                                        Due {formatDueDate(task.dueDate)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {filteredTasks.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchQuery ? 'No matching tasks' : `No ${selectedView.toLowerCase()} tasks`}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {searchQuery
                            ? `No tasks match "${searchQuery}". Try a different search term.`
                            : selectedView === 'Inbox' ? 'Create your first task to get started!' : ''
                          }
                        </p>
                        {!searchQuery && selectedView === 'Inbox' && (
                          <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            <Plus size={16} className="mr-2" />
                            Create Task
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        task={editingTask}
        onClose={closeEditModal}
        onSubmit={handleEditTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};