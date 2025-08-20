/**
 * API Service
 * Centralized service for handling all API requests
 */

class ApiService {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make an HTTP request
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @returns {Promise} - Promise resolving to the response data
   */
  async request(url, options = {}) {
    const requestOptions = {
      method: options.method || 'GET',
      headers: { ...this.defaultHeaders, ...options.headers },
      credentials: 'include', // Always include credentials for session cookies
      ...options,
    };

    // Add body if provided
    if (options.body) {
      // If it's FormData or options.transformRequest is false, don't transform
      if (options.body instanceof FormData || options.transformRequest === false) {
        requestOptions.body = options.body;
      } else {
        requestOptions.body = typeof options.body === 'string'
          ? options.body
          : JSON.stringify(options.body);
      }
    }

    try {
      console.log(`API ${requestOptions.method} request to: ${url}`);
      
      const response = await fetch(url, requestOptions);
      
      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        console.error('Authentication error: User not authenticated');
        // You could trigger a global auth error event here
        return { error: 'Unauthorized', status: 401 };
      }

      // For non-ok responses, try to parse error message
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error: ${response.status} ${errorText}`);
        return { 
          error: errorText || response.statusText,
          status: response.status 
        };
      }

      // For 204 No Content or empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return { success: true };
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error.message || 'Unknown error', isNetworkError: true };
    }
  }

  /**
   * Make a GET request
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @returns {Promise} - Promise resolving to the response data
   */
  get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} options - Request options
   * @returns {Promise} - Promise resolving to the response data
   */
  post(url, data, options = {}) {
    return this.request(url, { ...options, method: 'POST', body: data });
  }

  /**
   * Make a PUT request
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} options - Request options
   * @returns {Promise} - Promise resolving to the response data
   */
  put(url, data, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body: data });
  }

  /**
   * Make a DELETE request
   * @param {string} url - The URL to request
   * @param {Object} options - Request options
   * @returns {Promise} - Promise resolving to the response data
   */
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }
}

/**
 * Auth API Service
 * Handles authentication-related API requests
 */
class AuthApiService extends ApiService {
  /**
   * Check if user is authenticated
   * @returns {Promise} - Promise resolving to authentication status
   */
  async checkAuth() {
    return this.get('auth.php/check');
  }

  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise} - Promise resolving to login result
   */
  async login(credentials) {
    return this.post('auth.php/login', credentials);
  }

  /**
   * Logout user
   * @returns {Promise} - Promise resolving to logout result
   */
  async logout() {
    return this.post('auth.php/logout', {});
  }
}

/**
 * Tasks API Service
 * Handles task-related API requests
 */
class TasksApiService extends ApiService {
  /**
   * Get all tasks
   * @returns {Promise} - Promise resolving to tasks array
   */
  async getTasks() {
    return this.get('api.php/tasks');
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise} - Promise resolving to created task
   */
  async createTask(taskData) {
    return this.post('api.php/tasks', taskData);
  }

  /**
   * Update an existing task
   * @param {number} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise} - Promise resolving to update result
   */
  async updateTask(taskId, taskData) {
    return this.put(`api.php/tasks/${taskId}`, taskData);
  }

  /**
   * Delete a task
   * @param {number} taskId - Task ID
   * @returns {Promise} - Promise resolving to delete result
   */
  async deleteTask(taskId) {
    return this.delete(`api.php/tasks/${taskId}`);
  }

  /**
   * Update task status
   * @param {number} taskId - Task ID
   * @param {string} newStatus - New status
   * @param {Array} images - Task images
   * @param {Object} taskData - Additional task data
   * @returns {Promise} - Promise resolving to update result
   */
  async updateTaskStatus(taskId, newStatus, images = [], taskData = {}) {
    const updateData = {
      title: taskData.title || '',
      description: taskData.description || '',
      status: newStatus,
      images: images,
      ...taskData
    };
    
    return this.updateTask(taskId, updateData);
  }

  /**
   * Batch update task orders
   * @param {Array} updates - Array of task updates
   * @returns {Promise} - Promise resolving to all update results
   */
  async batchUpdateTaskOrders(updates) {
    const updatePromises = updates.map(update => 
      this.updateTask(update.id, {
        title: update.title,
        description: update.description,
        status: update.status,
        images: update.images,
        order: update.order
      })
    );
    
    return Promise.all(updatePromises);
  }

  /**
   * Clean up unused images
   * @returns {Promise} - Promise resolving to cleanup result
   */
  async cleanupImages() {
    return this.post('api.php/cleanup-images', {});
  }
}

/**
 * Upload API Service
 * Handles file upload API requests
 */
class UploadApiService extends ApiService {
  /**
   * Upload images
   * @param {FormData} formData - Form data with images
   * @returns {Promise} - Promise resolving to upload result
   */
  async uploadImages(formData) {
    // Make sure we're not setting any Content-Type header
    // so the browser can set the correct multipart/form-data with boundary
    return this.request('upload.php', {
      method: 'POST',
      body: formData,
      headers: {}, // Empty headers to avoid Content-Type being set
      // Don't transform the body - it's already FormData
      transformRequest: false
    });
  }

  /**
   * Upload logo
   * @param {FormData} formData - Form data with logo
   * @returns {Promise} - Promise resolving to upload result
   */
  async uploadLogo(formData) {
    // Make sure we're not setting any Content-Type header
    // so the browser can set the correct multipart/form-data with boundary
    return this.request('upload_logo.php', {
      method: 'POST',
      body: formData,
      headers: {}, // Empty headers to avoid Content-Type being set
      // Don't transform the body - it's already FormData
      transformRequest: false
    });
  }
}

/**
 * API Service Factory
 * Creates and exports instances of API services
 */
const api = new ApiService();
const authApi = new AuthApiService();
const tasksApi = new TasksApiService();
const uploadApi = new UploadApiService();

export { api, authApi, tasksApi, uploadApi };