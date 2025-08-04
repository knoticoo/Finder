'use client'

import { useState, useEffect } from 'react'
import { 
  StarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { reviewsAPI, bookingsAPI } from '@/lib/api'

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  service: {
    id: string
    title: string
    images: string[]
  }
  provider: {
    id: string
    firstName: string
    lastName: string
  }
  providerResponse?: string
}

interface Booking {
  id: string
  status: string
  scheduledDate: string
  service: {
    id: string
    title: string
    images: string[]
  }
  provider: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [bookingsForReview, setBookingsForReview] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
    fetchBookingsForReview()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getUserReviews()
      if (response.data.success) {
        setReviews(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBookingsForReview = async () => {
    try {
      const response = await bookingsAPI.getUserBookings({ status: 'COMPLETED' })
      if (response.data.success) {
        // Filter bookings that don't have reviews yet
        const bookingsWithoutReviews = response.data.data.filter((booking: any) => 
          !reviews.some(review => review.service.id === booking.service.id)
        )
        setBookingsForReview(bookingsWithoutReviews)
      }
    } catch (error) {
      console.error('Error fetching bookings for review:', error)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBooking) return

    setIsSubmitting(true)
    try {
      const response = await reviewsAPI.create({
        bookingId: selectedBooking.id,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment
      })

      if (response.data.success) {
        setShowReviewForm(false)
        setSelectedBooking(null)
        setReviewData({ rating: 5, title: '', comment: '' })
        fetchReviews()
        fetchBookingsForReview()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās iesniegt atsauksmi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditReview = async (reviewId: string, updatedData: any) => {
    try {
      const response = await reviewsAPI.update(reviewId, updatedData)
      if (response.data.success) {
        fetchReviews()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās atjaunināt atsauksmi')
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo atsauksmi?')) return

    try {
      const response = await reviewsAPI.delete(reviewId)
      if (response.data.success) {
        fetchReviews()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās dzēst atsauksmi')
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mani Vērtējumi</h1>
            <p className="mt-1 text-sm text-gray-600">
              Pārvaldiet savus vērtējumus un atsauksmes
            </p>
          </div>
          {bookingsForReview.length > 0 && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Jauns vērtējums
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
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
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center">
                        {getRatingStars(review.rating)}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {review.title || review.service.title}
                      </h3>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span>
                        {review.provider.firstName} {review.provider.lastName}
                      </span>
                      <span className="mx-2">•</span>
                      <span>{review.service.title}</span>
                      <span className="mx-2">•</span>
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>{new Date(review.createdAt).toLocaleDateString('lv-LV')}</span>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                    )}

                    {review.providerResponse && (
                      <div className="mt-3 pl-4 border-l-2 border-blue-200">
                        <p className="text-xs text-gray-500 mb-1">Sniedzēja atbilde:</p>
                        <p className="text-sm text-gray-700">{review.providerResponse}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedBooking({
                          id: review.id,
                          status: 'COMPLETED',
                          scheduledDate: review.createdAt,
                          service: review.service,
                          provider: review.provider
                        })
                        setReviewData({
                          rating: review.rating,
                          title: review.title,
                          comment: review.comment
                        })
                        setShowReviewForm(true)
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Rediģēt
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Dzēst
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nav vērtējumu</h3>
            <p className="mt-1 text-sm text-gray-500">
              Jums vēl nav ierakstījis nekādu vērtējumu.
            </p>
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedBooking ? 'Rediģēt vērtējumu' : 'Jauns vērtējums'}
                </h3>
                <button
                  onClick={() => {
                    setShowReviewForm(false)
                    setSelectedBooking(null)
                    setReviewData({ rating: 5, title: '', comment: '' })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Aizvērt</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {selectedBooking && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Pakalpojums</h4>
                    <p className="text-sm text-gray-600">{selectedBooking.service.title}</p>
                    <p className="text-sm text-gray-600">
                      Sniedzējs: {selectedBooking.provider.firstName} {selectedBooking.provider.lastName}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vērtējums
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`h-8 w-8 ${
                            star <= reviewData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Virsraksts (nav obligāts)
                  </label>
                  <input
                    type="text"
                    value={reviewData.title}
                    onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                    placeholder="Īss virsraksts jūsu atsauksmei"
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Atsauksme
                  </label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    rows={4}
                    placeholder="Dalieties ar savu pieredzi..."
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false)
                      setSelectedBooking(null)
                      setReviewData({ rating: 5, title: '', comment: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Atcelt
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Iesniegšana...' : 'Iesniegt vērtējumu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}