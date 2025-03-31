import api from './api';
import { handleError } from './errorHandler';

/**
 * Service for managing tasks
 */
export const taskService = {
  /**
   * Get all tasks with optional filtering
   * @param {Object} filters - Optional filters (contact_id, company_id, status)
   * @returns {Promise<Array>} Array of task objects
   */
  getTasks: async (filters = {}) => {
    try {
      // Convert filters object to query string
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await api.get(`/tasks${queryString}`);
      return response.data;
    } catch (error) {
      return handleError(error, 'Error fetching tasks');
    }
  },

  /**
   * Get a specific task by ID
   * @param {number} taskId - Task ID
   * @returns {Promise<Object>} Task object
   */
  getTaskById: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      return handleError(error, `Error fetching task ${taskId}`);
    }
  },

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task object
   */
  createTask: async (taskData) => {
    try {
      const response = await api.post('/tasks', taskData);
      return response.data;
    } catch (error) {
      return handleError(error, 'Error creating task');
    }
  },

  /**
   * Update an existing task
   * @param {number} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} Updated task object
   */
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response.data;
    } catch (error) {
      return handleError(error, `Error updating task ${taskId}`);
    }
  },

  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @returns {Promise<Object>} Success message
   */
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      return handleError(error, `Error deleting task ${taskId}`);
    }
  },

  /**
   * Get task counts by status
   * @returns {Promise<Object>} Object with count per status
   */
  getTasksCount: async () => {
    try {
      const response = await api.get('/tasks/count');
      return response.data;
    } catch (error) {
      return handleError(error, 'Error fetching task counts');
    }
  }
}; 