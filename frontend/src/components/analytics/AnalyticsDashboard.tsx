'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  UsersIcon,
  StarIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  overview: {
    totalEarnings: number
    totalBookings: number
    averageRating: number
    totalCustomers: number
    completionRate: number
    responseTime: number
  }
  trends: {
    earnings: { date: string; amount: number }[]
    bookings: { date: string; count: number }[]
    ratings: { date: string; rating: number }[]
  }
  topServices: {
    id: string
    title: string
    bookings: number
    earnings: number
    rating: number
  }[]
  customerInsights: {
    newCustomers: number
    returningCustomers: number
    topLocations: { location: string; bookings: number }[]
    peakHours: { hour: number; bookings: number }[]
  }
}

interface AnalyticsDashboardProps {
  userId: string
  timeRange: 'week' | 'month' | 'year'
}

export default function AnalyticsDashboard({ userId, timeRange }: AnalyticsDashboardProps) {
  const t = useTranslations('analytics')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analytics?timeRange=${timeRange}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        } else {
          setError(t('fetchError'))
        }
      } catch (error) {
        setError(t('fetchError'))
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [userId, timeRange, t])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('error')}</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUpIcon className="h-4 w-4 text-green-500" />
    } else if (current < previous) {
      return <TrendingDownIcon className="h-4 w-4 text-red-500" />
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyEuroIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('totalEarnings')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(data.overview.totalEarnings)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('totalBookings')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.overview.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('averageRating')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.overview.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('totalCustomers')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.overview.totalCustomers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('performanceMetrics')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">{t('completionRate')}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(data.overview.completionRate)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ClockIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">{t('avgResponseTime')}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {data.overview.responseTime} {t('minutes')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('customerInsights')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('newCustomers')}</span>
              <span className="text-sm font-medium text-gray-900">
                {data.customerInsights.newCustomers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('returningCustomers')}</span>
              <span className="text-sm font-medium text-gray-900">
                {data.customerInsights.returningCustomers}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t('topServices')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('service')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('bookings')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('earnings')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('rating')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topServices.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(service.earnings)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      {service.rating.toFixed(1)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Locations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">{t('topLocations')}</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {data.customerInsights.topLocations.map((location, index) => (
              <div key={location.location} className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{location.location}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {location.bookings} {t('bookings')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}