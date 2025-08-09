'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  WrenchScrewdriverIcon, 
  CalendarIcon, 
  StarIcon, 
  CurrencyEuroIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'
import { bookingsAPI, userAPI, servicesAPI } from '@/lib/api'
import NotificationBell from '@/components/notifications/NotificationBell'
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard'

export default function ProviderDashboard() {
  const [stats, setStats] = useState({
    totalServices: 0,
    activeBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalReviews: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentServices, setRecentServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user stats
        const statsResponse = await userAPI.getStats()
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data)
        }

        // Fetch recent bookings
        const bookingsResponse = await bookingsAPI.getProviderBookings({ limit: 5 })
        if (bookingsResponse.data.success) {
          setRecentBookings(bookingsResponse.data.data)
        }

        // Fetch recent services
        const servicesResponse = await servicesAPI.getAll({ limit: 5, providerOnly: true })
        if (servicesResponse.data.success) {
          setRecentServices(servicesResponse.data.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
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
      {/* Header with Notifications */}
      <div className="flex items-center justify-between">
        <div className="bg-white rounded-lg shadow p-6 flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Laipni lūdzam, sniedzēj!
          </h1>
          <p className="text-gray-600">
            Šeit jūs varat pārvaldīt savus pakalpojumus un rezervācijas.
          </p>
        </div>
        <div className="ml-4">
          <NotificationBell />
        </div>
      </div>

      {/* Analytics Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ChartBarIcon className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Analīze</h2>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="week">Nedēļa</option>
              <option value="month">Mēnesis</option>
              <option value="year">Gads</option>
            </select>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              {showAnalytics ? 'Slēpt analīzi' : 'Rādīt analīzi'}
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="bg-white rounded-lg shadow p-6">
          <AnalyticsDashboard userId="current" timeRange={timeRange} />
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktīvie pakalpojumi</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-yellow-600" />
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
              <p className="text-sm font-medium text-gray-500">Kopējie ienākumi</p>
              <p className="text-2xl font-semibold text-gray-900">€{stats.totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings and services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Pēdējās rezervācijas</h3>
              <Link
                href="/dashboard/provider/bookings"
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
                          {booking.customer?.firstName} {booking.customer?.lastName}
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
                  Jums vēl nav saņemts nekādu rezervāciju.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent services */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Mani pakalpojumi</h3>
              <Link
                href="/dashboard/provider/services"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Pārvaldīt
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentServices.length > 0 ? (
              recentServices.map((service: any) => (
                <div key={service.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {service.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.category?.name} • {service.subcategory?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="ml-1 text-sm text-gray-600">
                          {service.averageRating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        €{service.price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nav pakalpojumu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Jums vēl nav izveidots nekādu pakalpojumu.
                </p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/provider/services"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Pievienot pakalpojumu
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/provider/services"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pārvaldīt pakalpojumus</h3>
              <p className="text-sm text-gray-500">Pievienot, rediģēt vai dzēst pakalpojumus</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/provider/bookings"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Rezervācijas</h3>
              <p className="text-sm text-gray-500">Pārvaldīt un apstiprināt rezervācijas</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/provider/messages"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Ziņojumi</h3>
              <p className="text-sm text-gray-500">Sazināties ar klientiem</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}