'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { bookingsAPI } from '@/lib/api'

interface Booking {
  id: string
  scheduledDate: string
  scheduledTime: string
  duration: number
  status: string
  totalAmount: number
  address: string
  city: string
  postalCode: string
  notes: string
  createdAt: string
  service: {
    id: string
    title: string
    price: number
    priceType: string
    images: string[]
  }
  provider: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    averageRating: number
    totalReviews: number
  }
}

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [selectedStatus])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {}
      const response = await bookingsAPI.getUserBookings(params)
      if (response.data.success) {
        setBookings(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Vai tiešām vēlaties atcelt šo rezervāciju?')) return

    setIsCancelling(true)
    try {
      const response = await bookingsAPI.cancelBooking(bookingId)
      if (response.data.success) {
        fetchBookings()
        setShowDetails(false)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās atcelt rezervāciju')
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'CANCELLED':
        return <XMarkIcon className="h-5 w-5 text-red-500" />
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriceText = (booking: Booking) => {
    if (booking.service.priceType === 'FIXED') {
      return `€${booking.totalAmount.toFixed(2)}`
    } else if (booking.service.priceType === 'HOURLY') {
      return `€${booking.service.price.toFixed(2)}/st × ${booking.duration}h`
    } else {
      return `No €${booking.totalAmount.toFixed(2)}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mani Rezervācijas</h1>
            <p className="mt-1 text-sm text-gray-600">
              Pārvaldiet savas rezervācijas un skatiet to statusu
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Jauna rezervācija
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrēt pēc statusa:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Visi statusi</option>
            <option value="PENDING">Gaida apstiprinājumu</option>
            <option value="CONFIRMED">Apstiprināts</option>
            <option value="IN_PROGRESS">Tiek veikts</option>
            <option value="COMPLETED">Pabeigts</option>
            <option value="CANCELLED">Atcelts</option>
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(booking.status)}
                      <h3 className="text-lg font-medium text-gray-900">
                        {booking.service.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>
                          {new Date(booking.scheduledDate).toLocaleDateString('lv-LV')} - {booking.scheduledTime}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{booking.duration} stundas</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{booking.city}</span>
                      </div>
                      <div className="flex items-center">
                        <CurrencyEuroIcon className="h-4 w-4 mr-2" />
                        <span className="font-medium">{getPriceText(booking)}</span>
                      </div>
                    </div>

                    <div className="flex items-center mt-3 text-sm text-gray-600">
                      <UserIcon className="h-4 w-4 mr-2" />
                      <span>
                        {booking.provider.firstName} {booking.provider.lastName}
                      </span>
                      <span className="mx-2">•</span>
                      <span>⭐ {booking.provider.averageRating.toFixed(1)} ({booking.provider.totalReviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking)
                        setShowDetails(true)
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Detaļas
                    </button>
                    <Link
                      href={`/dashboard/customer/messages?provider=${booking.provider.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      Ziņojumi
                    </Link>
                    {booking.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={isCancelling}
                        className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Atcelt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
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

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Rezervācijas detaļas</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{selectedBooking.service.title}</h4>
                  <div className="flex items-center space-x-2 mb-3">
                    {getStatusIcon(selectedBooking.status)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusText(selectedBooking.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Datums un laiks</label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedBooking.scheduledDate).toLocaleDateString('lv-LV')} - {selectedBooking.scheduledTime}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ilgums</label>
                    <p className="text-sm text-gray-900">{selectedBooking.duration} stundas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adrese</label>
                    <p className="text-sm text-gray-900">
                      {selectedBooking.address}, {selectedBooking.city} {selectedBooking.postalCode}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kopējā cena</label>
                    <p className="text-sm font-medium text-gray-900">{getPriceText(selectedBooking)}</p>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Piezīmes</label>
                    <p className="text-sm text-gray-900">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Pakalpojumu sniedzējs</h5>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedBooking.provider.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedBooking.provider.firstName} {selectedBooking.provider.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        ⭐ {selectedBooking.provider.averageRating.toFixed(1)} ({selectedBooking.provider.totalReviews} atsauksmes)
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    <p>📧 {selectedBooking.provider.email}</p>
                    {selectedBooking.provider.phone && (
                      <p>📞 {selectedBooking.provider.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Aizvērt
                  </button>
                  <Link
                    href={`/dashboard/customer/messages?provider=${selectedBooking.provider.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Sazināties
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}