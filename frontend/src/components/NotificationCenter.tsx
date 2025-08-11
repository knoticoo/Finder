'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  BellIcon, 
  XMarkIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  StarIcon,
  CreditCardIcon,
  CogIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'BOOKING_UPDATE' | 'MESSAGE_RECEIVED' | 'REVIEW_RECEIVED' | 'PAYMENT_UPDATE' | 'SERVICE_UPDATE' | 'SYSTEM_UPDATE' | 'PROMOTIONAL'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isRead: boolean
  readAt?: string
  actionUrl?: string
  actionText?: string
  relatedId?: string
  relatedType?: string
  metadata?: any
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

const notificationIcons = {
  INFO: InformationCircleIcon,
  SUCCESS: CheckCircleIcon,
  WARNING: ExclamationTriangleIcon,
  ERROR: XCircleIcon,
  BOOKING_UPDATE: CogIcon,
  MESSAGE_RECEIVED: EnvelopeIcon,
  REVIEW_RECEIVED: StarIcon,
  PAYMENT_UPDATE: CreditCardIcon,
  SERVICE_UPDATE: CogIcon,
  SYSTEM_UPDATE: CogIcon,
  PROMOTIONAL: SpeakerWaveIcon
}

const notificationColors = {
  INFO: 'text-blue-500 bg-blue-50',
  SUCCESS: 'text-green-500 bg-green-50',
  WARNING: 'text-yellow-500 bg-yellow-50',
  ERROR: 'text-red-500 bg-red-50',
  BOOKING_UPDATE: 'text-purple-500 bg-purple-50',
  MESSAGE_RECEIVED: 'text-indigo-500 bg-indigo-50',
  REVIEW_RECEIVED: 'text-orange-500 bg-orange-50',
  PAYMENT_UPDATE: 'text-green-500 bg-green-50',
  SERVICE_UPDATE: 'text-blue-500 bg-blue-50',
  SYSTEM_UPDATE: 'text-gray-500 bg-gray-50',
  PROMOTIONAL: 'text-pink-500 bg-pink-50'
}

const priorityBorders = {
  LOW: '',
  NORMAL: '',
  HIGH: 'border-l-4 border-l-orange-400',
  URGENT: 'border-l-4 border-l-red-500'
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Mock data for demonstration
  useEffect(() => {
    if (user) {
      // Mock notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New Booking Confirmed',
          message: 'Your booking for House Cleaning has been confirmed for tomorrow at 10:00 AM.',
          type: 'BOOKING_UPDATE',
          priority: 'HIGH',
          isRead: false,
          actionUrl: '/dashboard/bookings/1',
          actionText: 'View Booking',
          relatedId: '1',
          relatedType: 'booking',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Payment Received',
          message: 'You received €85.00 payment for your cleaning service.',
          type: 'PAYMENT_UPDATE',
          priority: 'NORMAL',
          isRead: false,
          actionUrl: '/dashboard/payments/2',
          actionText: 'View Payment',
          relatedId: '2',
          relatedType: 'payment',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'New Message',
          message: 'Anna sent you a message about your plumbing service.',
          type: 'MESSAGE_RECEIVED',
          priority: 'NORMAL',
          isRead: true,
          readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          actionUrl: '/dashboard/messages/3',
          actionText: 'View Message',
          relatedId: '3',
          relatedType: 'message',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          title: 'Service Approved',
          message: 'Your service "Professional Massage Therapy" has been approved and is now live.',
          type: 'SERVICE_UPDATE',
          priority: 'HIGH',
          isRead: false,
          actionUrl: '/dashboard/services/4',
          actionText: 'View Service',
          relatedId: '4',
          relatedType: 'service',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      setNotifications(mockNotifications)
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length)
    }
  }, [user])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString()
      }))
    )
    setUnreadCount(0)
  }

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && !notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'urgent':
        return notification.priority === 'URGENT' || notification.priority === 'HIGH'
      default:
        return true
    }
  })

  const formatTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  if (!user) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      >
        {unreadCount > 0 ? (
          <BellSolidIcon className="h-6 w-6" />
        ) : (
          <BellIcon className="h-6 w-6" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex space-x-4 mt-2">
              <button
                onClick={() => setFilter('all')}
                className={`text-sm ${filter === 'all' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`text-sm ${filter === 'unread' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`text-sm ${filter === 'urgent' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Important
              </button>
            </div>
          </div>

          {/* Actions */}
          {unreadCount > 0 && (
            <div className="px-4 py-2 border-b border-gray-100 bg-blue-50">
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const IconComponent = notificationIcons[notification.type]
                  const colorClasses = notificationColors[notification.type]
                  const priorityBorder = priorityBorders[notification.priority]
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${priorityBorder} ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              
                              {/* Action Button */}
                              {notification.actionUrl && notification.actionText && (
                                <button
                                  onClick={() => {
                                    // Handle navigation
                                    if (!notification.isRead) {
                                      markAsRead(notification.id)
                                    }
                                    setIsOpen(false)
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-2"
                                >
                                  {notification.actionText}
                                </button>
                              )}
                              
                              <p className="text-xs text-gray-500 mt-2">
                                {formatTimeAgo(notification.createdAt)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                  title="Mark as read"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="Delete notification"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BellIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // Navigate to full notifications page
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}