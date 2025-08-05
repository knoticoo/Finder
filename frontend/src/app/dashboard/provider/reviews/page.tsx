'use client'

import { useState, useEffect } from 'react'
import { 
  StarIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserIcon,
  ArrowUturnLeftIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { reviewsAPI } from '@/lib/api'

interface Review {
  id: string
  rating: number
  title: string
  comment: string
  createdAt: string
  service: {
    id: string
    title: string
  }
  customer: {
    id: string
    firstName: string
    lastName: string
  }
  providerResponse?: string
}

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  })

  useEffect(() => {
    fetchReviews()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [reviews])

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getProviderReviews()
      if (response.data.success) {
        setReviews(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = () => {
    if (reviews.length === 0) return

    const totalReviews = reviews.length
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    })

    setStats({
      totalReviews,
      averageRating,
      ratingDistribution
    })
  }

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReview) return

    setIsSubmitting(true)
    try {
      const response = await reviewsAPI.respondToReview(selectedReview.id, { response: responseText })
      if (response.data.success) {
        setShowResponseForm(false)
        setSelectedReview(null)
        setResponseText('')
        fetchReviews()
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās iesniegt atbildi')
    } finally {
      setIsSubmitting(false)
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

  const getRatingPercentage = (rating: number) => {
    if (stats.totalReviews === 0) return 0
    return Math.round((stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.totalReviews) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Atsauksmes</h1>
            <p className="mt-1 text-sm text-gray-600">
              Pārvaldiet klientu atsauksmes un atbildiet uz tām
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <StarIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Kopējās atsauksmes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-600" />
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
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Atbildētās atsauksmes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {reviews.filter(r => r.providerResponse).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vērtējumu sadalījums</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center">
              <div className="flex items-center w-16">
                <span className="text-sm font-medium text-gray-900">{rating}</span>
                <StarIcon className="h-4 w-4 text-yellow-400 fill-current ml-1" />
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${getRatingPercentage(rating)}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-12 text-right">
                <span className="text-sm text-gray-600">{getRatingPercentage(rating)}%</span>
              </div>
            </div>
          ))}
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
                        {review.customer.firstName} {review.customer.lastName}
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
                        <p className="text-xs text-gray-500 mb-1">Jūsu atbilde:</p>
                        <p className="text-sm text-gray-700">{review.providerResponse}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!review.providerResponse && (
                      <button
                        onClick={() => {
                          setSelectedReview(review)
                          setShowResponseForm(true)
                        }}
                        className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
                        Atbildēt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nav atsauksmju</h3>
            <p className="mt-1 text-sm text-gray-500">
              Jums vēl nav saņemts nekādu atsauksmi.
            </p>
          </div>
        )}
      </div>

      {/* Response Form Modal */}
      {showResponseForm && selectedReview && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Atbildēt uz atsauksmi</h3>
                <button
                  onClick={() => {
                    setShowResponseForm(false)
                    setSelectedReview(null)
                    setResponseText('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Aizvērt</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Klienta atsauksme</h4>
                <div className="flex items-center mb-2">
                  {getRatingStars(selectedReview.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    {selectedReview.customer.firstName} {selectedReview.customer.lastName}
                  </span>
                </div>
                {selectedReview.comment && (
                  <p className="text-sm text-gray-700">{selectedReview.comment}</p>
                )}
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jūsu atbilde
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows={4}
                    placeholder="Rakstiet savu atbildi klientam..."
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResponseForm(false)
                      setSelectedReview(null)
                      setResponseText('')
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
                    {isSubmitting ? 'Iesniegšana...' : 'Iesniegt atbildi'}
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