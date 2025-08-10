import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track auth state
let isRefreshing = false
let failedQueue: Array<{ resolve: (value: any) => void; reject: (reason?: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      const currentPath = window.location.pathname
      
      // Don't redirect if we're already on auth pages
      if (currentPath.includes('/auth/')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          const token = localStorage.getItem('token')
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Try to refresh the token
        const refreshResponse = await api.post('/api/auth/refresh-token')
        
        if (refreshResponse.data.success) {
          const { token, user } = refreshResponse.data
          
          // Update stored auth data
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          
          // Update the authorization header
          api.defaults.headers.Authorization = `Bearer ${token}`
          originalRequest.headers.Authorization = `Bearer ${token}`
          
          processQueue(null, token)
          
          // Retry the original request
          return api(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        
        // Clear auth data and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        console.warn('Token refresh failed, redirecting to login')
        window.location.href = '/auth/login'
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      console.error('Backend server is not accessible:', error.message)
      // Don't redirect on network errors - just show the error
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  register: (data: any) => api.post('/api/auth/register', data),
  login: (data: any) => api.post('/api/auth/login', data),
  forgotPassword: (data: any) => api.post('/api/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/api/auth/reset-password', data),
  refreshToken: () => api.post('/api/auth/refresh-token'),
}

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data: any) => api.put('/api/users/profile', data),
  updateProviderProfile: (data: any) => api.put('/api/users/provider-profile', data),
  getStats: () => api.get('/api/users/stats'),
}

export const servicesAPI = {
  getAll: (params?: any) => api.get('/api/services', { params }),
  getById: (id: string) => api.get(`/api/services/${id}`),
  getCategories: () => api.get('/api/services/categories'),
  create: (data: any) => api.post('/api/services', data),
  update: (id: string, data: any) => api.put(`/api/services/${id}`, data),
  delete: (id: string) => api.delete(`/api/services/${id}`),
}

export const bookingsAPI = {
  create: (data: any) => api.post('/api/bookings', data),
  getUserBookings: (params?: any) => api.get('/api/bookings/user', { params }),
  getProviderBookings: (params?: any) => api.get('/api/bookings/provider', { params }),
  getById: (id: string) => api.get(`/api/bookings/user/${id}`),
  updateStatus: (id: string, data: any) => api.put(`/api/bookings/provider/${id}/status`, data),
  cancel: (id: string, data: any) => api.put(`/api/bookings/user/${id}/cancel`, data),
}

export const reviewsAPI = {
  create: (data: any) => api.post('/api/reviews', data),
  getServiceReviews: (serviceId: string, params?: any) => 
    api.get(`/api/reviews/service/${serviceId}`, { params }),
  getProviderReviews: (providerId: string, params?: any) => 
    api.get(`/api/reviews/provider/${providerId}`, { params }),
  update: (id: string, data: any) => api.put(`/api/reviews/${id}`, data),
  delete: (id: string) => api.delete(`/api/reviews/${id}`),
  respond: (id: string, data: any) => api.post(`/api/reviews/${id}/respond`, data),
}

export const messagesAPI = {
  send: (data: any) => api.post('/api/messages', data),
  getConversations: () => api.get('/api/messages/conversations'),
  getConversation: (params: any) => api.get('/api/messages/conversation', { params }),
  markAsRead: (data: any) => api.put('/api/messages/read', data),
  delete: (id: string) => api.delete(`/api/messages/${id}`),
}