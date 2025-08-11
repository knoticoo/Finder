'use client'

import { useState, useEffect } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { getApiBaseUrl, getHealthUrl } from '@/lib/config'

interface DebugInfo {
  apiUrl: string
  backendHealth: boolean
  userToken: boolean
  currentPath: string
  userRole: string | null
  timestamp: string
}

export default function VPSDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  const gatherDebugInfo = async () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    let userRole = null
    
    try {
      if (user) {
        const userData = JSON.parse(user)
        userRole = userData.role
      }
    } catch (e) {
      console.error('Error parsing user data:', e)
    }

    let backendHealth = false
    try {
      const response = await fetch(getHealthUrl())
      backendHealth = response.ok
    } catch (e) {
      backendHealth = false
    }

    setDebugInfo({
      apiUrl: getApiBaseUrl(),
      backendHealth,
      userToken: !!token,
      currentPath: window.location.pathname,
      userRole,
      timestamp: new Date().toLocaleString('lv-LV')
    })
  }

  useEffect(() => {
    gatherDebugInfo()
    
    // Update debug info every 10 seconds
    const interval = setInterval(gatherDebugInfo, 10000)
    
    return () => clearInterval(interval)
  }, [])

  // Only show in development or when explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full opacity-50 hover:opacity-100 z-50"
        title="Show debug info"
      >
        <InformationCircleIcon className="h-5 w-5" />
      </button>
    )
  }

  if (!debugInfo) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">VPS Debug Info</span>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        <div>
          <span className="text-gray-400">API URL:</span> {debugInfo.apiUrl}
        </div>
        <div>
          <span className="text-gray-400">Backend:</span>{' '}
          <span className={debugInfo.backendHealth ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.backendHealth ? '✓ Online' : '✗ Offline'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Token:</span>{' '}
          <span className={debugInfo.userToken ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.userToken ? '✓ Present' : '✗ Missing'}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Path:</span> {debugInfo.currentPath}
        </div>
        <div>
          <span className="text-gray-400">Role:</span> {debugInfo.userRole || 'Unknown'}
        </div>
        <div>
          <span className="text-gray-400">Updated:</span> {debugInfo.timestamp}
        </div>
      </div>
      
      <button
        onClick={gatherDebugInfo}
        className="mt-2 w-full bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded text-xs"
      >
        Refresh
      </button>
    </div>
  )
}