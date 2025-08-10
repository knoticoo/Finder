import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdvancedSearchFilters, { SearchFilters } from '../AdvancedSearchFilters'

describe('AdvancedSearchFilters', () => {
  const defaultFilters: SearchFilters = {
    search: '',
    sortBy: 'relevance'
  }

  const mockOnFiltersChange = jest.fn()
  const mockOnToggleExpanded = jest.fn()

  const defaultProps = {
    filters: defaultFilters,
    onFiltersChange: mockOnFiltersChange,
    isExpanded: false,
    onToggleExpanded: mockOnToggleExpanded
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Quick Filters Bar', () => {
    it('renders search input and sort dropdown', () => {
      render(<AdvancedSearchFilters {...defaultProps} />)
      
      expect(screen.getByPlaceholderText('Search services...')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Most Relevant')).toBeInTheDocument()
    })

    it('calls onFiltersChange when search term changes', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search services...')
      await user.type(searchInput, 'cleaning')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        search: 'cleaning'
      })
    })

    it('calls onFiltersChange when sort option changes', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...defaultProps} />)
      
      const sortSelect = screen.getByDisplayValue('Most Relevant')
      await user.selectOptions(sortSelect, 'price_low')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        sortBy: 'price_low'
      })
    })

    it('shows filter count badge when filters are active', () => {
      const filtersWithActiveFilters: SearchFilters = {
        ...defaultFilters,
        category: 'Cleaning',
        priceMin: 50
      }
      
      render(<AdvancedSearchFilters {...defaultProps} filters={filtersWithActiveFilters} />)
      
      expect(screen.getByText('2')).toBeInTheDocument() // Badge showing 2 active filters
    })

    it('calls onToggleExpanded when filters button is clicked', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...defaultProps} />)
      
      const filtersButton = screen.getByText('Filters')
      await user.click(filtersButton)
      
      expect(mockOnToggleExpanded).toHaveBeenCalled()
    })
  })

  describe('Expanded Filters Panel', () => {
    const expandedProps = { ...defaultProps, isExpanded: true }

    it('shows advanced filters when expanded', () => {
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Location')).toBeInTheDocument()
      expect(screen.getByLabelText('Price Range')).toBeInTheDocument()
      expect(screen.getByLabelText('Minimum Rating')).toBeInTheDocument()
    })

    it('does not show advanced filters when collapsed', () => {
      render(<AdvancedSearchFilters {...defaultProps} />)
      
      expect(screen.queryByLabelText('Category')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Location')).not.toBeInTheDocument()
    })
  })

  describe('Category and Subcategory Filtering', () => {
    const expandedProps = { ...defaultProps, isExpanded: true }

    it('updates category filter when category is selected', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const categorySelect = screen.getByLabelText('Category')
      await user.selectOptions(categorySelect, 'Cleaning')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category: 'Cleaning',
        subcategory: undefined // Should clear subcategory when category changes
      })
    })

    it('shows subcategory options when category is selected', () => {
      const filtersWithCategory: SearchFilters = {
        ...defaultFilters,
        category: 'Cleaning'
      }
      
      render(<AdvancedSearchFilters {...defaultProps} filters={filtersWithCategory} isExpanded={true} />)
      
      expect(screen.getByLabelText('Subcategory')).toBeInTheDocument()
      expect(screen.getByText('House Cleaning')).toBeInTheDocument()
      expect(screen.getByText('Office Cleaning')).toBeInTheDocument()
    })

    it('updates subcategory filter when subcategory is selected', async () => {
      const user = userEvent.setup()
      const filtersWithCategory: SearchFilters = {
        ...defaultFilters,
        category: 'Cleaning'
      }
      
      render(<AdvancedSearchFilters {...defaultProps} filters={filtersWithCategory} isExpanded={true} />)
      
      const subcategorySelect = screen.getByLabelText('Subcategory')
      await user.selectOptions(subcategorySelect, 'House Cleaning')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...filtersWithCategory,
        subcategory: 'House Cleaning'
      })
    })
  })

  describe('Location and Availability Filtering', () => {
    const expandedProps = { ...defaultProps, isExpanded: true }

    it('updates location filter when location is selected', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const locationSelect = screen.getByLabelText('Location')
      await user.selectOptions(locationSelect, 'Rīga')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        location: 'Rīga'
      })
    })

    it('updates availability filter when availability is selected', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const availabilitySelect = screen.getByLabelText('Availability')
      await user.selectOptions(availabilitySelect, 'immediate')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        availability: 'immediate'
      })
    })
  })

  describe('Price and Rating Filtering', () => {
    const expandedProps = { ...defaultProps, isExpanded: true }

    it('updates price min filter when min price is entered', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const minPriceInput = screen.getByPlaceholderText('Min')
      await user.type(minPriceInput, '50')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        priceMin: 50
      })
    })

    it('updates price max filter when max price is entered', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const maxPriceInput = screen.getByPlaceholderText('Max')
      await user.type(maxPriceInput, '200')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        priceMax: 200
      })
    })

    it('updates rating filter when minimum rating is selected', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const ratingSelect = screen.getByLabelText('Minimum Rating')
      await user.selectOptions(ratingSelect, '4.0')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        rating: 4.0
      })
    })
  })

  describe('Service Details Filtering', () => {
    const expandedProps = { ...defaultProps, isExpanded: true }

    it('updates service type filter when service type is selected', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const serviceTypeSelect = screen.getByLabelText('Service Type')
      await user.selectOptions(serviceTypeSelect, 'one_time')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        serviceType: 'one_time'
      })
    })

    it('updates experience filter when experience level is selected', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const experienceSelect = screen.getByLabelText('Provider Experience')
      await user.selectOptions(experienceSelect, 'expert')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        experience: 'expert'
      })
    })

    it('updates verification filter when verification status is selected', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...expandedProps} />)
      
      const verificationSelect = screen.getByLabelText('Verification Status')
      await user.selectOptions(verificationSelect, 'verified')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        verification: 'verified'
      })
    })
  })

  describe('Clear Filters Functionality', () => {
    const expandedProps = { ...defaultProps, isExpanded: true }

    it('clears all filters except search when clear all is clicked', async () => {
      const user = userEvent.setup()
      const filtersWithMultipleActive: SearchFilters = {
        search: 'cleaning',
        category: 'Cleaning',
        location: 'Rīga',
        priceMin: 50,
        priceMax: 200,
        rating: 4.0,
        sortBy: 'price_low'
      }
      
      render(<AdvancedSearchFilters {...expandedProps} filters={filtersWithMultipleActive} />)
      
      const clearButton = screen.getByText('Clear All Filters')
      await user.click(clearButton)
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: 'cleaning', // Search should be preserved
        sortBy: 'relevance'
      })
    })

    it('shows correct count of active filters', () => {
      const filtersWithMultipleActive: SearchFilters = {
        search: 'cleaning',
        category: 'Cleaning',
        location: 'Rīga',
        priceMin: 50,
        sortBy: 'price_low'
      }
      
      render(<AdvancedSearchFilters {...defaultProps} filters={filtersWithMultipleActive} isExpanded={true} />)
      
      // Should show 3 filters (category, location, priceMin) - search and sortBy are excluded
      expect(screen.getByText('3 filters applied')).toBeInTheDocument()
    })
  })

  describe('Filter State Persistence', () => {
    it('displays current filter values correctly', () => {
      const existingFilters: SearchFilters = {
        search: 'massage',
        category: 'Beauty',
        location: 'Rīga',
        priceMin: 30,
        priceMax: 100,
        rating: 4.5,
        sortBy: 'rating',
        availability: 'today',
        serviceType: 'one_time',
        experience: 'expert',
        verification: 'verified'
      }
      
      render(<AdvancedSearchFilters {...defaultProps} filters={existingFilters} isExpanded={true} />)
      
      expect(screen.getByDisplayValue('massage')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Beauty')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Rīga')).toBeInTheDocument()
      expect(screen.getByDisplayValue('30')).toBeInTheDocument()
      expect(screen.getByDisplayValue('100')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Highest Rated')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper labels for all form controls', () => {
      render(<AdvancedSearchFilters {...defaultProps} isExpanded={true} />)
      
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Location')).toBeInTheDocument()
      expect(screen.getByLabelText('Price Range')).toBeInTheDocument()
      expect(screen.getByLabelText('Minimum Rating')).toBeInTheDocument()
      expect(screen.getByLabelText('Service Type')).toBeInTheDocument()
      expect(screen.getByLabelText('Provider Experience')).toBeInTheDocument()
      expect(screen.getByLabelText('Verification Status')).toBeInTheDocument()
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search services...')
      const sortSelect = screen.getByDisplayValue('Most Relevant')
      
      // Tab navigation should work
      searchInput.focus()
      expect(searchInput).toHaveFocus()
      
      await user.tab()
      expect(sortSelect).toHaveFocus()
    })
  })

  describe('Responsive Behavior', () => {
    it('applies responsive grid classes', () => {
      render(<AdvancedSearchFilters {...defaultProps} isExpanded={true} />)
      
      const gridContainer = screen.getByLabelText('Category').closest('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })
  })

  describe('Error Handling', () => {
    it('handles invalid price inputs gracefully', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...defaultProps} isExpanded={true} />)
      
      const minPriceInput = screen.getByPlaceholderText('Min')
      await user.type(minPriceInput, 'invalid')
      
      // Should not call onFiltersChange with invalid number
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        priceMin: undefined
      })
    })

    it('handles empty string inputs correctly', async () => {
      const user = userEvent.setup()
      render(<AdvancedSearchFilters {...defaultProps} isExpanded={true} />)
      
      const categorySelect = screen.getByLabelText('Category')
      await user.selectOptions(categorySelect, '')
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...defaultFilters,
        category: undefined
      })
    })
  })
})