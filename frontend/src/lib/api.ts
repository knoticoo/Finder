import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth/login'
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