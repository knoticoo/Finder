'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  StarIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { servicesAPI, bookingsAPI, reviewsAPI } from '@/lib/api'

interface Service {
  id: string
  title: string
  description: string
  price: number
  priceType: string
  currency: string
  averageRating: number
  totalReviews: number
  category: { name: string }
  subcategory: { name: string }
  provider: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    averageRating: number
    totalReviews: number
    isVerified: boolean
  }
  images: string[]
  videos: string[]
  serviceArea: string[]
  travelFee: number
  isAvailable: boolean
  createdAt: string
}

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  customer: {
    firstName: string
    lastName: string
    avatar: string
  }
  providerResponse?: string
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingData, setBookingData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    duration: 1,
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  })
  const [isBooking, setIsBooking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchServiceDetails()
    fetchReviews()
  }, [serviceId])

  const fetchServiceDetails = async () => {
    try {
      const response = await servicesAPI.getById(serviceId)
      if (response.data.success) {
        setService(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching service details:', error)
      setError('Neizdevās ielādēt pakalpojuma informāciju')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getServiceReviews(serviceId)
      if (response.data.success) {
        setReviews(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBooking(true)
    setError('')

    try {
      const totalAmount = service!.price * bookingData.duration + (service!.travelFee || 0)
      
      const response = await bookingsAPI.create({
        serviceId,
        scheduledDate: bookingData.scheduledDate,
        scheduledTime: bookingData.scheduledTime,
        duration: bookingData.duration,
        address: bookingData.address,
        city: bookingData.city,
        postalCode: bookingData.postalCode,
        notes: bookingData.notes,
        totalAmount
      })

      if (response.data.success) {
        router.push('/dashboard/customer/bookings')
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Neizdevās izveidot rezervāciju')
    } finally {
      setIsBooking(false)
    }
  }

  const getPriceText = (service: Service) => {
    if (service.priceType === 'FIXED') {
      return `€${service.price.toFixed(2)}`
    } else if (service.priceType === 'HOURLY') {
      return `€${service.price.toFixed(2)}/st`
    } else {
      return `No €${service.price.toFixed(2)}`
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Pakalpojums nav atrasts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pieprasītais pakalpojums neeksistē vai ir dzēsts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-700">Sākums</a>
            </li>
            <li>/</li>
            <li>
              <a href="/services" className="hover:text-gray-700">Pakalpojumi</a>
            </li>
            <li>/</li>
            <li className="text-gray-900">{service.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9">
                  <div className="w-full h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    {service.images && service.images.length > 0 ? (
                      <img
                        src={service.images[selectedImage]}
                        alt={service.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <WrenchScrewdriverIcon className="h-24 w-24 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Image thumbnails */}
                {service.images && service.images.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex space-x-2">
                      {service.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`w-16 h-16 rounded border-2 ${
                            selectedImage === index ? 'border-blue-500' : 'border-white'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${service.title} ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{service.category.name}</span>
                    <span>•</span>
                    <span>{service.subcategory.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {getPriceText(service)}
                  </div>
                  {service.travelFee > 0 && (
                    <div className="text-sm text-gray-500">
                      + €{service.travelFee} ceļa maksa
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  {getRatingStars(service.averageRating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {service.averageRating.toFixed(1)} ({service.totalReviews} atsauksmes)
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>Darba zona: {service.serviceArea.join(', ')}</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Apraksts</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{service.description}</p>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Atsauksmes ({reviews.length})
              </h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {review.customer.firstName.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {review.customer.firstName} {review.customer.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('lv-LV')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {getRatingStars(review.rating)}
                        </div>
                      </div>
                      
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                      )}
                      
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                      
                      {review.providerResponse && (
                        <div className="mt-3 pl-4 border-l-2 border-blue-200">
                          <p className="text-xs text-gray-500 mb-1">Sniedzēja atbilde:</p>
                          <p className="text-sm text-gray-700">{review.providerResponse}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Vēl nav atsauksmju par šo pakalpojumu.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Provider Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pakalpojumu sniedzējs</h3>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-medium">
                  {service.provider.firstName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {service.provider.firstName} {service.provider.lastName}
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    {getRatingStars(service.provider.averageRating)}
                    <span className="ml-1">
                      {service.provider.averageRating.toFixed(1)} ({service.provider.totalReviews})
                    </span>
                  </div>
                </div>
                {service.provider.isVerified && (
                  <CheckCircleIcon className="ml-2 h-5 w-5 text-green-500" />
                )}
              </div>

              <div className="space-y-2 text-sm">
                {service.provider.phone && (
                  <div className="flex items-center text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span>{service.provider.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  <span>{service.provider.email}</span>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <ChatBubbleLeftRightIcon className="h-4 w-4 inline mr-2" />
                Sazināties
              </button>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rezervēt pakalpojumu</h3>
              
              {!service.isAvailable ? (
                <div className="text-center py-4">
                  <ExclamationTriangleIcon className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
                  <p className="text-sm text-gray-600">Pakalpojums nav pieejams</p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datums
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingData.scheduledDate}
                      onChange={(e) => setBookingData({ ...bookingData, scheduledDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Laiks
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingData.scheduledTime}
                      onChange={(e) => setBookingData({ ...bookingData, scheduledTime: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ilgums (stundas)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="24"
                      required
                      value={bookingData.duration}
                      onChange={(e) => setBookingData({ ...bookingData, duration: parseInt(e.target.value) })}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Adrese
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingData.address}
                      onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                      placeholder="Ievadiet adresi"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pilsēta
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingData.city}
                        onChange={(e) => setBookingData({ ...bookingData, city: e.target.value })}
                        placeholder="Rīga"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pasta indekss
                      </label>
                      <input
                        type="text"
                        required
                        value={bookingData.postalCode}
                        onChange={(e) => setBookingData({ ...bookingData, postalCode: e.target.value })}
                        placeholder="LV-1001"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Papildu informācija
                    </label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      rows={3}
                      placeholder="Papildu prasības vai piezīmes..."
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Pakalpojuma cena:</span>
                      <span>€{(service.price * bookingData.duration).toFixed(2)}</span>
                    </div>
                    {service.travelFee > 0 && (
                      <div className="flex justify-between text-sm mb-2">
                        <span>Ceļa maksa:</span>
                        <span>€{service.travelFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Kopā:</span>
                      <span>€{(service.price * bookingData.duration + (service.travelFee || 0)).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBooking}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isBooking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                        Rezervēšana...
                      </>
                    ) : (
                      'Rezervēt pakalpojumu'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}