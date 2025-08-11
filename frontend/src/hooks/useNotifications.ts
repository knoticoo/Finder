import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { getApiBaseUrl } from '@/lib/config'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'booking' | 'message' | 'review' | 'payment'
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  isConnected: boolean
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const baseUrl = getApiBaseUrl()

    const newSocket = io(baseUrl, {
      auth: {
        token
      }
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to notification server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from notification server')
    })

    newSocket.on('notification', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: notification.id,
          requireInteraction: notification.type === 'error' || notification.type === 'warning'
        })
      }
    })

    newSocket.on('notifications', (notificationsList: Notification[]) => {
      setNotifications(notificationsList)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Load notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const apiBase = getApiBaseUrl()
        const response = await fetch(`${apiBase}/api/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      }
    }

    loadNotifications()
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiBase = getApiBaseUrl()
      const response = await fetch(`${apiBase}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiBase = getApiBaseUrl()
      const response = await fetch(`${apiBase}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        )
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiBase = getApiBaseUrl()
      const response = await fetch(`${apiBase}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    isConnected
  }
}