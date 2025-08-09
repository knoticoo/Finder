'use client'

import { ChartBarIcon } from '@heroicons/react/24/outline'

interface AnalyticsDashboardProps {
  userId: string
  timeRange: 'week' | 'month' | 'year'
}

export default function AnalyticsDashboard({ userId, timeRange }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Analīzes dati</h3>
          <p className="mt-1 text-sm text-gray-500">
            Analīzes funkcionalitāte būs pieejama drīzumā. Periods: {timeRange}
          </p>
        </div>
      </div>
    </div>
  )
}