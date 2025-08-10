'use client'

import { useState, useEffect } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function NetworkStatus() {
  const [isBackendReachable, setIsBackendReachable] = useState<boolean | null>(null)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/health', {
        method: 'GET',
        timeout: 5000,
      })
      
      if (response.ok) {
        setIsBackendReachable(true)
      } else {
        setIsBackendReachable(false)
      }
    } catch (error) {
      console.error('Backend health check failed:', error)
      setIsBackendReachable(false)
    }
    setLastCheck(new Date())
  }

  useEffect(() => {
    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  if (isBackendReachable === null) {
    return null // Still checking
  }

  if (isBackendReachable) {
    return null // No need to show anything when working
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-2 text-center text-sm">
      <div className="flex items-center justify-center space-x-2">
        <ExclamationTriangleIcon className="h-5 w-5" />
        <span>Savienojums ar serveri ir pārtraukts. Lūdzu, pārbaudiet interneta savienojumu.</span>
        <button 
          onClick={checkBackendStatus}
          className="ml-4 underline hover:no-underline"
        >
          Mēģināt vēlreiz
        </button>
      </div>
      {lastCheck && (
        <div className="text-xs opacity-75 mt-1">
          Pēdējā pārbaude: {lastCheck.toLocaleTimeString('lv-LV')}
        </div>
      )}
    </div>
  )
}