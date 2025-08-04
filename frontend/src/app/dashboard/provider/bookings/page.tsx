'use client'

import { useState, useEffect } from 'react'
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
  ChatBubbleLeftRightIcon,
  CheckIcon,
  PlayIcon
} from '@heroicons/react/24/outline'
import { bookingsAPI } from '@/lib/api'
import Link from 'next/link'

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
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [selectedStatus])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {}
      const response = await bookingsAPI.getProviderBookings(params)
      if (response.data.success) {
        setBookings(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await bookingsAPI.updateBookingStatus(bookingId, { status: newStatus })
      if (response.data.success) {
        fetchBookings()
        setShowDetails(false)
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās atjaunināt statusu')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'CANCELLED':
        return <XMarkIcon className="h-5 w-5 text-red-500" />
      case 'IN_PROGRESS':
        return <PlayIcon className="h-5 w-5 text-blue-500" />
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

  const getStatusActions = (booking: Booking) => {
    switch (booking.status) {
      case 'PENDING':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
              disabled={isUpdating}
              className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Apstiprināt
            </button>
            <button
              onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
              disabled={isUpdating}
              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Noliegt
            </button>
          </div>
        )
      case 'CONFIRMED':
        return (
          <button
            onClick={() => handleStatusUpdate(booking.id, 'IN_PROGRESS')}
            disabled={isUpdating}
            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <PlayIcon className="h-4 w-4 mr-1" />
            Sākt darbu
          </button>
        )
      case 'IN_PROGRESS':
        return (
          <button
            onClick={() => handleStatusUpdate(booking.id, 'COMPLETED')}
            disabled={isUpdating}
            className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Pabeigt
          </button>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rezervācijas</h1>
            <p className="mt-1 text-sm text-gray-600">
              Pārvaldiet klientu rezervācijas un atjauniniet to statusu
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Gaida apstiprinājumu</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter(b => b.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Apstiprinātas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter(b => b.status === 'CONFIRMED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PlayIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tiek veiktas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter(b => b.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pabeigtas</p>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter(b => b.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
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
                        {booking.customer.firstName} {booking.customer.lastName}
                      </span>
                      <span className="mx-2">•</span>
                      <span>📧 {booking.customer.email}</span>
                      {booking.customer.phone && (
                        <>
                          <span className="mx-2">•</span>
                          <span>📞 {booking.customer.phone}</span>
                        </>
                      )}
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
                      href={`/dashboard/provider/messages?customer=${booking.customer.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      Ziņojumi
                    </Link>
                    {getStatusActions(booking)}
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
              Jums vēl nav saņemts nekādu rezervāciju.
            </p>
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
                    <label className="block text-sm font-medium text-gray-700">Klienta piezīmes</label>
                    <p className="text-sm text-gray-900">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Klients</h5>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-medium">
                      {selectedBooking.customer.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedBooking.customer.firstName} {selectedBooking.customer.lastName}
                      </p>
                      <p className="text-sm text-gray-600">📧 {selectedBooking.customer.email}</p>
                      {selectedBooking.customer.phone && (
                        <p className="text-sm text-gray-600">📞 {selectedBooking.customer.phone}</p>
                      )}
                    </div>
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
                    href={`/dashboard/provider/messages?customer=${selectedBooking.customer.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Sazināties
                  </Link>
                  {getStatusActions(selectedBooking)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}