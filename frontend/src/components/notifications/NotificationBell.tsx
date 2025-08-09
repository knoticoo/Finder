'use client'

import { useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'

interface NotificationBellProps {
  className?: string
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount] = useState(0) // Temporary placeholder

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        aria-label="Paziņojumi"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-medium text-gray-900">Paziņojumi</h3>
            <p className="text-gray-500 text-sm mt-2">Nav jaunu paziņojumu</p>
          </div>
        </div>
      )}
    </div>
  )
}