'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CalendarIcon, 
  StarIcon, 
  ChatBubbleLeftRightIcon,
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { bookingsAPI, userAPI } from '@/lib/api'

export default function CustomerDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalReviews: 0,
    averageRating: 0,
    totalSpent: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user stats
        const statsResponse = await userAPI.getStats()
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data)
        }

        // Fetch recent bookings
        const bookingsResponse = await bookingsAPI.getUserBookings({ limit: 5 })
        if (bookingsResponse.data.success) {
          setRecentBookings(bookingsResponse.data.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Don't show error for network issues, just show empty state
        if (error?.response?.status === 401) {
          // Token is invalid, let the interceptor handle it
          return
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'CANCELLED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Gaida apstiprinājumu'
      case 'CONFIRMED':
        return 'Apstiprināts'
      case 'IN_PROGRESS':
        return 'Tiek veikts'
      case 'COMPLETED':
        return 'Pabeigts'
      case 'CANCELLED':
        return 'Atcelts'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Laipni lūdzam atpakaļ!
        </h1>
        <p className="text-gray-600">
          Šeit jūs varat pārvaldīt savas rezervācijas un apskatīt aktivitāti.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Kopējās rezervācijas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktīvās rezervācijas</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Vidējais vērtējums</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Kopējās izmaksas</p>
              <p className="text-2xl font-semibold text-gray-900">€{stats.totalSpent.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Pēdējās rezervācijas</h3>
            <Link
              href="/dashboard/customer/bookings"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Skatīt visas
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentBookings.length > 0 ? (
            recentBookings.map((booking: any) => (
              <div key={booking.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getStatusIcon(booking.status)}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {booking.service?.title || 'Pakalpojums'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.scheduledDate).toLocaleDateString('lv-LV')} - {booking.scheduledTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getStatusText(booking.status)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      €{booking.totalAmount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nav rezervāciju</h3>
              <p className="mt-1 text-sm text-gray-500">
                Jums vēl nav veikts nekādu rezervāciju.
              </p>
              <div className="mt-6">
                <Link
                  href="/services"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Atrast pakalpojumus
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/services"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Rezervēt pakalpojumu</h3>
              <p className="text-sm text-gray-500">Atrast un rezervēt jaunus pakalpojumus</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/messages"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Ziņojumi</h3>
              <p className="text-sm text-gray-500">Sazināties ar pakalpojumu sniedzējiem</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/customer/profile"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Mani vērtējumi</h3>
              <p className="text-sm text-gray-500">Apskatīt un pārvaldīt vērtējumus</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}