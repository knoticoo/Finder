'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
  BellIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  StarIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'booking' | 'message' | 'review' | 'payment'
  title: string
  message: string
  timestamp: string
  read: boolean
  data?: any
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  unreadCount: number
}

export default function NotificationCenter({ 
  isOpen, 
  onClose, 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onDelete, 
  unreadCount 
}: NotificationCenterProps) {
  const t = useTranslations('notifications')
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
      case 'booking':
        return <CalendarIcon className="h-5 w-5 text-purple-500" />
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />
      case 'review':
        return <StarIcon className="h-5 w-5 text-yellow-500" />
      case 'payment':
        return <CurrencyEuroIcon className="h-5 w-5 text-green-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50'
      case 'error':
        return 'border-l-red-500 bg-red-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50'
      case 'booking':
        return 'border-l-purple-500 bg-purple-50'
      case 'message':
        return 'border-l-blue-500 bg-blue-50'
      case 'review':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'payment':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return t('justNow')
    } else if (diffInMinutes < 60) {
      return t('minutesAgo', { minutes: diffInMinutes })
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return t('hoursAgo', { hours })
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return t('daysAgo', { days })
    }
  }

  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t('notifications')}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {t('markAllAsRead')}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('all')} ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === 'unread'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('unread')} ({unreadCount})
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {activeTab === 'unread' ? t('noUnreadNotifications') : t('noNotifications')}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === 'unread' ? t('noUnreadDescription') : t('noNotificationsDescription')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 ${getNotificationClass(notification.type)} ${
                        !notification.read ? 'bg-blue-50 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${
                              !notification.read ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {notification.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.timestamp)}
                              </span>
                              <button
                                onClick={() => onDelete(notification.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className={`text-sm mt-1 ${
                            !notification.read ? 'text-blue-800' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                            >
                              {t('markAsRead')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}