'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  StarIcon,
  ClockIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  categories: any[]
  loading?: boolean
}

export interface SearchFilters {
  query: string
  categoryId: string
  subcategoryId: string
  priceRange: { min: number | null; max: number | null }
  rating: number | null
  location: string
  availability: string[]
  sortBy: string
  features: string[]
}

export default function AdvancedSearch({ onSearch, categories, loading = false }: AdvancedSearchProps) {
  const t = useTranslations('search')
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categoryId: '',
    subcategoryId: '',
    priceRange: { min: null, max: null },
    rating: null,
    location: '',
    availability: [],
    sortBy: 'relevance',
    features: []
  })

  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters.query])

  useEffect(() => {
    if (debouncedQuery !== filters.query) {
      setFilters(prev => ({ ...prev, query: debouncedQuery }))
    }
  }, [debouncedQuery])

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      categoryId: '',
      subcategoryId: '',
      priceRange: { min: null, max: null },
      rating: null,
      location: '',
      availability: [],
      sortBy: 'relevance',
      features: []
    })
  }

  const hasActiveFilters = () => {
    return filters.categoryId || 
           filters.subcategoryId || 
           filters.priceRange.min || 
           filters.priceRange.max || 
           filters.rating || 
           filters.location || 
           filters.availability.length > 0 || 
           filters.features.length > 0
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Basic Search */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            placeholder={t('placeholder')}
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
        >
          <FunnelIcon className="h-5 w-5" />
          <span className="hidden sm:inline">{t('filters')}</span>
        </button>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? t('searching') : t('search')}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('category')}
              </label>
              <select
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('allCategories')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('location')}
              </label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder={t('locationPlaceholder')}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('priceRange')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('min')}
                  value={filters.priceRange.min || ''}
                  onChange={(e) => handleFilterChange('priceRange', { 
                    ...filters.priceRange, 
                    min: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder={t('max')}
                  value={filters.priceRange.max || ''}
                  onChange={(e) => handleFilterChange('priceRange', { 
                    ...filters.priceRange, 
                    max: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('minRating')}
              </label>
              <select
                value={filters.rating || ''}
                onChange={(e) => handleFilterChange('rating', e.target.value ? parseInt(e.target.value) : null)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('anyRating')}</option>
                <option value="4">{t('fourPlus')}</option>
                <option value="3">{t('threePlus')}</option>
                <option value="2">{t('twoPlus')}</option>
              </select>
            </div>
          </div>

          {/* Availability & Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('availability')}
              </label>
              <div className="space-y-2">
                {[
                  { value: 'immediate', label: t('immediate') },
                  { value: 'same_day', label: t('sameDay') },
                  { value: 'next_day', label: t('nextDay') },
                  { value: 'weekend', label: t('weekend') }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.availability.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('availability', [...filters.availability, option.value])
                        } else {
                          handleFilterChange('availability', filters.availability.filter(a => a !== option.value))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('features')}
              </label>
              <div className="space-y-2">
                {[
                  { value: 'verified', label: t('verifiedProvider') },
                  { value: 'insured', label: t('insured') },
                  { value: 'licensed', label: t('licensed') },
                  { value: 'background_checked', label: t('backgroundChecked') }
                ].map((option) => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.features.includes(option.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('features', [...filters.features, option.value])
                        } else {
                          handleFilterChange('features', filters.features.filter(f => f !== option.value))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sortBy')}
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">{t('relevance')}</option>
              <option value="price_asc">{t('priceAsc')}</option>
              <option value="price_desc">{t('priceDesc')}</option>
              <option value="rating">{t('rating')}</option>
              <option value="distance">{t('distance')}</option>
              <option value="newest">{t('newest')}</option>
            </select>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  {t('clearFilters')}
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {hasActiveFilters() ? t('filtersActive') : t('noFilters')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}