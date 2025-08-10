'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MagnifyingGlassIcon, MapPinIcon, StarIcon, UserIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { servicesAPI } from '@/lib/api'

interface Service {
  id: string
  title: string
  description: string
  price: number
  category: string
  location: string
  averageRating: number
  totalReviews: number
  provider: {
    firstName: string
    lastName: string
  }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll()
      if (response.data.success) {
        setServices(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      // Don't redirect on error - services page should work for everyone
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await servicesAPI.getCategories()
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleBookService = (serviceId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login')
    } else {
      router.push(`/dashboard/customer/bookings?service=${serviceId}`)
    }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ielādē pakalpojumus...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
                  ← Sākums
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Pakalpojumi</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <UserIcon className="h-5 w-5" />
                      <span>{user.firstName} {user.lastName}</span>
                      {user.role === 'ADMIN' && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Admin
                        </span>
                      )}
                      {user.role === 'PROVIDER' && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Provider
                        </span>
                      )}
                    </div>
                    <Link
                      href="/dashboard"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Iziet
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Ieiet
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Reģistrēties
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Meklēt pakalpojumus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Visas kategorijas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nav atrasti pakalpojumi</p>
            <p className="text-gray-400 mt-2">
              Mēģiniet mainīt meklēšanas kritērijus
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {service.title}
                    </h3>
                    <span className="text-lg font-bold text-blue-600">
                      €{service.price}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {service.location}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(service.averageRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">
                        ({service.totalReviews})
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {service.provider.firstName} {service.provider.lastName}
                    </span>
                  </div>

                  <div className="mt-4">
                    {isAuthenticated ? (
                      <button
                        onClick={() => handleBookService(service.id)}
                        className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Rezervēt pakalpojumu
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push('/auth/register')}
                        className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Reģistrēties, lai rezervētu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}