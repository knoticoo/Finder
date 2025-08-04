'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  StarIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  MapPinIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { servicesAPI } from '@/lib/api'

interface Service {
  id: string
  title: string
  description: string
  price: number
  priceType: string
  currency: string
  averageRating: number
  totalReviews: number
  isAvailable: boolean
  category: {
    id: string
    name: string
  }
  subcategory: {
    id: string
    name: string
  }
  images: string[]
  serviceArea: string[]
  travelFee: number
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  subcategories: { id: string; name: string }[]
}

export default function ProviderServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll({ providerOnly: true })
      if (response.data.success) {
        setServices(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setIsLoading(false)
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

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Vai tiešām vēlaties dzēst šo pakalpojumu?')) return

    setIsDeleting(serviceId)
    try {
      const response = await servicesAPI.delete(serviceId)
      if (response.data.success) {
        setServices(services.filter(service => service.id !== serviceId))
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās dzēst pakalpojumu')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleToggleAvailability = async (service: Service) => {
    try {
      const response = await servicesAPI.update(service.id, {
        ...service,
        isAvailable: !service.isAvailable
      })
      if (response.data.success) {
        setServices(services.map(s => 
          s.id === service.id 
            ? { ...s, isAvailable: !s.isAvailable }
            : s
        ))
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Neizdevās atjaunināt pakalpojumu')
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
        className={`h-4 w-4 ${
          i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mani Pakalpojumi</h1>
          <p className="mt-1 text-sm text-gray-600">
            Pārvaldiet savus pakalpojumus un iestatījumus
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Pievienot Pakalpojumu
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Kopējie pakalpojumi</p>
              <p className="text-2xl font-semibold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktīvie pakalpojumi</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.filter(s => s.isAvailable).length}
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
              <p className="text-sm font-medium text-gray-500">Vidējais vērtējums</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.length > 0 
                  ? (services.reduce((sum, s) => sum + s.averageRating, 0) / services.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyEuroIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Kopējās atsauksmes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.reduce((sum, s) => sum + s.totalReviews, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pakalpojumu saraksts</h3>
        </div>

        {services.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {services.map((service) => (
              <div key={service.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <WrenchScrewdriverIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900 truncate">
                          {service.title}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {service.isAvailable ? 'Aktīvs' : 'Neaktīvs'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {service.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <CurrencyEuroIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {getPriceText(service)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {service.serviceArea.length} apgabali
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {service.averageRating.toFixed(1)} ({service.totalReviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingService(service)}
                      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(service)}
                      className={`p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        service.isAvailable 
                          ? 'text-green-400 hover:text-green-600' 
                          : 'text-red-400 hover:text-red-600'
                      }`}
                    >
                      {service.isAvailable ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        <XCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      disabled={isDeleting === service.id}
                      className="p-2 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {isDeleting === service.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nav pakalpojumu</h3>
            <p className="mt-1 text-sm text-gray-500">
              Jums vēl nav izveidots nekādu pakalpojumu.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Pievienot pirmo pakalpojumu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingService ? 'Rediģēt Pakalpojumu' : 'Pievienot Jaunu Pakalpojumu'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {editingService 
                  ? 'Atjauniniet pakalpojuma informāciju'
                  : 'Izveidojiet jaunu pakalpojumu, ko piedāvāt klientiem'
                }
              </p>
              
              {/* Simple form for now - can be expanded */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pakalpojuma nosaukums
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Piemēram: Mājas tīrīšana"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Apraksts
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Detalizēts pakalpojuma apraksts..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cena
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cenas tips
                    </label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="FIXED">Fiksēta cena</option>
                      <option value="HOURLY">Stundas maksa</option>
                      <option value="NEGOTIABLE">Pārrunājama</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingService(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Atcelt
                </button>
                <button
                  onClick={() => {
                    // Handle save logic here
                    setShowCreateModal(false)
                    setEditingService(null)
                  }}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingService ? 'Saglabāt' : 'Izveidot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}