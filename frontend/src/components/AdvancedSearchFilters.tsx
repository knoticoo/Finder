'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, XMarkIcon, FunnelIcon, MapPinIcon, CurrencyEuroIcon, StarIcon } from '@heroicons/react/24/outline'

interface FilterProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  isExpanded: boolean
  onToggleExpanded: () => void
}

export interface SearchFilters {
  search?: string
  category?: string
  subcategory?: string
  location?: string
  priceMin?: number
  priceMax?: number
  rating?: number
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'distance'
  availability?: 'immediate' | 'today' | 'this_week' | 'this_month'
  serviceType?: 'one_time' | 'recurring' | 'emergency'
  priceType?: 'fixed' | 'hourly' | 'custom'
  verification?: 'verified' | 'any'
  experience?: 'beginner' | 'intermediate' | 'expert' | 'any'
}

const categories = [
  'Cleaning',
  'Home Repair',
  'Moving',
  'Pet Care',
  'Tutoring',
  'Beauty',
  'Fitness',
  'Technology',
  'Automotive',
  'Gardening',
  'Event Planning',
  'Photography'
]

const subcategories: Record<string, string[]> = {
  'Cleaning': ['House Cleaning', 'Office Cleaning', 'Deep Cleaning', 'Window Cleaning', 'Carpet Cleaning'],
  'Home Repair': ['Plumbing', 'Electrical', 'Painting', 'Carpentry', 'Roofing'],
  'Moving': ['Full Service Moving', 'Packing', 'Storage', 'Local Moving', 'Long Distance'],
  'Pet Care': ['Dog Walking', 'Pet Sitting', 'Grooming', 'Training', 'Veterinary'],
  'Tutoring': ['Math', 'Science', 'Languages', 'Music', 'Test Prep'],
  'Beauty': ['Hair Styling', 'Makeup', 'Massage', 'Skincare', 'Nails'],
  'Fitness': ['Personal Training', 'Yoga', 'Nutrition', 'Sports Coaching', 'Physical Therapy'],
  'Technology': ['Computer Repair', 'Web Design', 'IT Support', 'Data Recovery', 'Software Development'],
  'Automotive': ['Car Repair', 'Car Washing', 'Towing', 'Oil Change', 'Tire Service'],
  'Gardening': ['Lawn Care', 'Landscaping', 'Tree Service', 'Garden Design', 'Pest Control'],
  'Event Planning': ['Wedding Planning', 'Birthday Parties', 'Corporate Events', 'Catering', 'Entertainment'],
  'Photography': ['Wedding Photography', 'Portrait Photography', 'Event Photography', 'Commercial Photography', 'Video Production']
}

const latvianCities = [
  'Rīga', 'Daugavpils', 'Liepāja', 'Jelgava', 'Jūrmala', 'Ventspils', 'Rēzekne', 'Valmiera',
  'Jēkabpils', 'Ogre', 'Tukums', 'Salaspils', 'Cēsis', 'Kuldīga', 'Bauska', 'Sigulda',
  'Dobele', 'Krāslava', 'Talsi', 'Limbaži'
]

export default function AdvancedSearchFilters({ filters, onFiltersChange, isExpanded, onToggleExpanded }: FilterProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    
    // Clear subcategory if category changes
    if (key === 'category') {
      newFilters.subcategory = undefined
    }
    
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      search: localFilters.search, // Keep search term
      sortBy: 'relevance'
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    const filterKeys = Object.keys(localFilters) as (keyof SearchFilters)[]
    return filterKeys.filter(key => {
      if (key === 'search' || key === 'sortBy') return false
      const value = localFilters[key]
      return value !== undefined && value !== '' && value !== 'any'
    }).length
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Quick Filters Bar */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Main Search */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search services..."
                value={localFilters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>

            {/* Sort By */}
            <select
              value={localFilters.sortBy || 'relevance'}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relevance">Most Relevant</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
              <option value="distance">Nearest First</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={onToggleExpanded}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isExpanded && (
        <div className="px-4 py-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category & Subcategory */}
            <div className="space-y-4">
                              <div>
                  <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category-select"
                    value={localFilters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {localFilters.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={localFilters.subcategory || ''}
                    onChange={(e) => updateFilter('subcategory', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Subcategories</option>
                    {subcategories[localFilters.category]?.map(subcategory => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Location & Distance */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="inline h-4 w-4 mr-1" />
                  Location
                </label>
                <select
                  value={localFilters.location || ''}
                  onChange={(e) => updateFilter('location', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {latvianCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={localFilters.availability || ''}
                  onChange={(e) => updateFilter('availability', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Time</option>
                  <option value="immediate">Available Now</option>
                  <option value="today">Available Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                </select>
              </div>
            </div>

            {/* Price & Rating */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyEuroIcon className="inline h-4 w-4 mr-1" />
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.priceMin || ''}
                    onChange={(e) => updateFilter('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.priceMax || ''}
                    onChange={(e) => updateFilter('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <StarIcon className="inline h-4 w-4 mr-1" />
                  Minimum Rating
                </label>
                <select
                  value={localFilters.rating || ''}
                  onChange={(e) => updateFilter('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3.0">3.0+ Stars</option>
                </select>
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={localFilters.serviceType || ''}
                  onChange={(e) => updateFilter('serviceType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Type</option>
                  <option value="one_time">One-time Service</option>
                  <option value="recurring">Recurring Service</option>
                  <option value="emergency">Emergency Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Experience
                </label>
                <select
                  value={localFilters.experience || 'any'}
                  onChange={(e) => updateFilter('experience', e.target.value === 'any' ? undefined : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="any">Any Experience</option>
                  <option value="expert">Expert (5+ years)</option>
                  <option value="intermediate">Intermediate (2-5 years)</option>
                  <option value="beginner">Beginner (&lt;2 years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select
                  value={localFilters.verification || 'any'}
                  onChange={(e) => updateFilter('verification', e.target.value === 'any' ? undefined : e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="any">All Providers</option>
                  <option value="verified">Verified Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Clear All Filters</span>
            </button>

            <div className="text-sm text-gray-600">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
            </div>
          </div>
        </div>
      )}
    </div>
  )
}