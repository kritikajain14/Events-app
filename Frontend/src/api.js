import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true, // Important for cookies/session
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    // Add timestamp to prevent caching for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.error('Access forbidden');
      // You can show a notification here
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error - make sure API server is running');
      // You can show a notification here
    }
    
    return Promise.reject(error);
  }
);

// Event endpoints
export const eventApi = {
  // Get all events with pagination and search
  getEvents: (params) => api.get('/events', { params }),
  
  // Get single event by ID
  getEventById: (id) => api.get(`/events/${id}`),
};

// Dashboard endpoints (protected)
export const dashboardApi = {
  // Get dashboard events with filters
  getDashboardEvents: (params) => api.get('/dashboard/events', { params }),
  
  // Import event to platform
  importEvent: (id, notes) => api.patch(`/dashboard/events/${id}/import`, { notes }),
  
  // Get event statistics
  getEventStats: () => api.get('/dashboard/stats'),
  
  // Bulk import events
  bulkImportEvents: (eventIds) => api.post('/dashboard/events/bulk-import', { eventIds }),
  
  // Export events
  exportEvents: (filters) => api.get('/dashboard/events/export', { 
    params: filters,
    responseType: 'blob' // For file download
  }),
};

// Auth endpoints
export const authApi = {
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Login (redirects to Google)
  login: () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL + "/api"
    }/auth/google`;
  },
  
  // Logout
  logout: () => api.get('/auth/logout'),
  
  // Check if user is authenticated
  checkAuth: () => api.get('/auth/check'),
};

// Admin endpoints (if needed)
export const adminApi = {
  // Get all users
  getUsers: () => api.get('/admin/users'),
  
  // Update user role
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  
  // Trigger manual scrape
  triggerScrape: () => api.post('/admin/scrape'),
  
  // Get scrape logs
  getScrapeLogs: () => api.get('/admin/scrape/logs'),
  
  // System stats
  getSystemStats: () => api.get('/admin/stats'),
};

// Utility functions for error handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data.message || 'An error occurred';
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return { message: 'Bad request: ' + message, type: 'error' };
      case 401:
        return { message: 'Please login to continue', type: 'warning' };
      case 403:
        return { message: 'You don\'t have permission to do this', type: 'error' };
      case 404:
        return { message: 'Resource not found', type: 'error' };
      case 429:
        return { message: 'Too many requests. Please try again later.', type: 'warning' };
      case 500:
        return { message: 'Server error. Please try again later.', type: 'error' };
      default:
        return { message: message, type: 'error' };
    }
  } else if (error.request) {
    // Request made but no response
    return { 
      message: 'Cannot connect to server. Please check your internet connection.', 
      type: 'error' 
    };
  } else {
    // Something else happened
    return { 
      message: error.message || 'An unexpected error occurred', 
      type: 'error' 
    };
  }
};

// Create a hook for using API with loading state
export const createApiHook = (apiFunction) => {
  return async (...args) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const execute = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const handledError = handleApiError(err);
        setError(handledError);
        throw err;
      } finally {
        setLoading(false);
      }
    };
    
    return { data, loading, error, execute };
  };
};

// ... existing imports ...

// Ticket leads endpoints
export const ticketApi = {
  // Create new ticket lead
  createTicketLead: (data) => api.post('/tickets', data),
  
  // Get user's tickets
  getMyTickets: () => api.get('/tickets/my-tickets', { withCredentials: true }),
  
  // Get tickets for a specific event (admin only)
  getEventTickets: (eventId) => api.get(`/tickets/event/${eventId}`, { withCredentials: true }),
  
  // Export user's tickets
  exportMyTickets: () => api.get('/tickets/export', {
    withCredentials: true,
    responseType: 'blob'
  }),
  
  // Export tickets for an event (admin only)
  exportEventTickets: (eventId) => api.get(`/tickets/export/${eventId}`, {
    withCredentials: true,
    responseType: 'blob'
  }),
};

// Export default api instance
export default api;