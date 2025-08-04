'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { BellIcon } from '@heroicons/react/24/outline'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationCenter from './NotificationCenter'

interface NotificationBellProps {
  className?: string
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const t = useTranslations('notifications')
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={handleToggle}
          className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          aria-label={t('notifications')}
        >
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <NotificationCenter
        isOpen={isOpen}
        onClose={handleClose}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        unreadCount={unreadCount}
      />
    </>
  )
}