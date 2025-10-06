import { apiClient } from './api';

export interface BackendTodo {
  ID: number;
  Content: string;
  UserID: number;
  Priority: string;   // "high", "medium", "low"
  Status: string;     // "todo", "completed", "in_progress"
  DueDate: string;    // YYYY-MM-DD形式の日付
  CreatedAt: string;
}

export interface FrontendTask {
  id: string;
  name: string;
  project: string;
  status: 'In Progress' | 'Completed' | 'To Do';
  dueDate: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

// バックエンドTodoをフロントエンドTaskに変換
const convertTodoToTask = (todo: BackendTodo): FrontendTask => {
  const content = todo.Content.toLowerCase();
  let project = 'General';
  
  // プロジェクト/カテゴリを判定
  if (content.includes('work') || content.includes('meeting') || content.includes('project')) {
    project = 'Work';
  } else if (content.includes('team') || content.includes('collaborate')) {
    project = 'Team';
  } else if (content.includes('personal') || content.includes('home') || content.includes('family')) {
    project = 'Personal';
  }

  // ステータスの変換
  let status: 'In Progress' | 'Completed' | 'To Do' = 'To Do';
  if (todo.Status === 'completed') {
    status = 'Completed';
  } else if (todo.Status === 'in_progress') {
    status = 'In Progress';
  }

  // バックエンドから取得した値を使用（デフォルト値も設定）
  const priority = (todo.Priority as 'high' | 'medium' | 'low') || 'medium';
  const dueDate = todo.DueDate || new Date().toISOString().split('T')[0];

  return {
    id: todo.ID.toString(),
    name: todo.Content,
    project,
    status,
    dueDate,
    priority,
    category: project
  };
};

// フロントエンドTaskをバックエンドTodo用に変換
const convertTaskToTodo = (task: Partial<FrontendTask>) => {
  // ステータスの変換
  let status = 'todo';
  if (task.status === 'Completed') {
    status = 'completed';
  } else if (task.status === 'In Progress') {
    status = 'in_progress';
  }

  return {
    content: task.name || '',
    priority: task.priority || 'medium',
    status: status,
    dueDate: task.dueDate || new Date().toISOString().split('T')[0]
  };
};

export const tasksApi = {
  // タスク一覧取得
  getTasks: async (): Promise<FrontendTask[]> => {
    try {
      const response = await apiClient.get('/todos');
      
      if (response.todos && Array.isArray(response.todos)) {
        return response.todos.map(convertTodoToTask);
      } else if (response.status === 'success' && response.todos) {
        return response.todos.map(convertTodoToTask);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      throw error;
    }
  },

  // タスク作成
  createTask: async (taskData: { name: string; description?: string; priority?: string; category?: string; dueDate?: string }): Promise<void> => {
    try {
      const todoData = {
        content: taskData.name,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0]
      };
      await apiClient.post('/todos/save', todoData);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw new Error('Failed to create task. Please try again.');
    }
  },

  // タスク更新
  updateTask: async (taskId: string, taskData: Partial<FrontendTask>): Promise<void> => {
    try {
      const todoData = convertTaskToTodo(taskData);
      await apiClient.post(`/todos/update/${taskId}`, todoData);
    } catch (error) {
      console.error('Failed to update task:', error);
      throw new Error('Failed to update task. Please try again.');
    }
  },

  // タスク削除
  deleteTask: async (taskId: string): Promise<void> => {
    try {
      await apiClient.post(`/todos/delete/${taskId}`, {});
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw new Error('Failed to delete task. Please try again.');
    }
  }
};