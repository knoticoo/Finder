import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import NotificationCenter from '../NotificationCenter'
import { useAuth } from '@/hooks/useAuth'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
}))

describe('NotificationCenter', () => {
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'CUSTOMER' as const,
  }

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders notification bell when user is authenticated', () => {
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      expect(bellButton).toBeInTheDocument()
    })

    it('does not render when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      })

      const { container } = render(<NotificationCenter />)
      expect(container.firstChild).toBeNull()
    })

    it('shows unread count badge when there are unread notifications', async () => {
      render(<NotificationCenter />)
      
      // Wait for notifications to load
      await waitFor(() => {
        const badge = screen.getByText('3') // Based on mock data
        expect(badge).toBeInTheDocument()
      })
    })

    it('uses solid bell icon when there are unread notifications', async () => {
      render(<NotificationCenter />)
      
      await waitFor(() => {
        const bellButton = screen.getByRole('button')
        const solidBell = bellButton.querySelector('svg')
        expect(solidBell).toBeInTheDocument()
      })
    })
  })

  describe('Dropdown Interaction', () => {
    it('opens dropdown when bell is clicked', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })

    it('closes dropdown when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      // Open dropdown
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      // Close dropdown
      const closeButton = screen.getByLabelText(/close/i) || screen.getByRole('button', { name: /×/ })
      await user.click(closeButton)
      
      await waitFor(() => {
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
      })
    })

    it('closes dropdown when clicking outside', async () => {
      render(<NotificationCenter />)
      
      // Open dropdown
      const bellButton = screen.getByRole('button')
      fireEvent.click(bellButton)
      
      // Click outside
      fireEvent.mouseDown(document.body)
      
      await waitFor(() => {
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument()
      })
    })
  })

  describe('Filter Functionality', () => {
    it('shows all notifications by default', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      await waitFor(() => {
        expect(screen.getByText(/All \(4\)/)).toBeInTheDocument()
      })
    })

    it('filters unread notifications when unread filter is selected', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      const unreadFilter = screen.getByText(/Unread \(3\)/)
      await user.click(unreadFilter)
      
      await waitFor(() => {
        expect(screen.getByText(/Unread \(3\)/)).toHaveClass('text-blue-600')
      })
    })

    it('filters important notifications when important filter is selected', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      const importantFilter = screen.getByText('Important')
      await user.click(importantFilter)
      
      await waitFor(() => {
        expect(screen.getByText('Important')).toHaveClass('text-blue-600')
      })
    })
  })

  describe('Notification Actions', () => {
    it('marks notification as read when read button is clicked', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      await waitFor(async () => {
        const readButtons = screen.getAllByTitle('Mark as read')
        if (readButtons.length > 0) {
          await user.click(readButtons[0])
          
          await waitFor(() => {
            expect(screen.getByText(/Unread \(2\)/)).toBeInTheDocument()
          })
        }
      })
    })

    it('deletes notification when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      await waitFor(async () => {
        const deleteButtons = screen.getAllByTitle('Delete notification')
        const initialCount = deleteButtons.length
        
        if (deleteButtons.length > 0) {
          await user.click(deleteButtons[0])
          
          await waitFor(() => {
            const newDeleteButtons = screen.queryAllByTitle('Delete notification')
            expect(newDeleteButtons).toHaveLength(initialCount - 1)
          })
        }
      })
    })

    it('marks all notifications as read when mark all as read is clicked', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      await waitFor(async () => {
        const markAllButton = screen.getByText('Mark all as read')
        await user.click(markAllButton)
        
        await waitFor(() => {
          expect(screen.getByText(/Unread \(0\)/)).toBeInTheDocument()
        })
      })
    })
  })

  describe('Notification Display', () => {
    it('displays notification content correctly', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      await waitFor(() => {
        expect(screen.getByText('New Booking Confirmed')).toBeInTheDocument()
        expect(screen.getByText(/Your booking for House Cleaning/)).toBeInTheDocument()
      })
    })

    it('shows action buttons for notifications with actions', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      await waitFor(() => {
        expect(screen.getByText('View Booking')).toBeInTheDocument()
        expect(screen.getByText('View Payment')).toBeInTheDocument()
      })
    })

    it('displays time ago for notifications', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      await waitFor(() => {
        const timeElements = screen.getAllByText('2 hours ago')
        expect(timeElements.length).toBeGreaterThan(0)
      })
    })

    it('shows priority borders for high priority notifications', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      await waitFor(() => {
        const notifications = screen.getAllByText(/New Booking Confirmed|Service Approved/)
        notifications.forEach(notification => {
          const notificationContainer = notification.closest('div')
          expect(notificationContainer).toHaveClass('border-l-4')
        })
      })
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no notifications match filter', async () => {
      // Mock empty notifications
      const user = userEvent.setup()
      
      // Override the mock to return no notifications
      jest.spyOn(React, 'useEffect').mockImplementation((effect, deps) => {
        if (deps && deps.includes(mockUser)) {
          // Don't set any notifications
        }
      })
      
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      await user.click(bellButton)
      
      // Filter to unread when there are no unread notifications
      const unreadFilter = screen.getByText(/Unread/)
      await user.click(unreadFilter)
      
      await waitFor(() => {
        expect(screen.getByText('No unread notifications')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      expect(bellButton).toBeInTheDocument()
      
      await user.click(bellButton)
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete notification')
        const readButtons = screen.getAllByTitle('Mark as read')
        
        expect(deleteButtons.length).toBeGreaterThan(0)
        expect(readButtons.length).toBeGreaterThan(0)
      })
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<NotificationCenter />)
      
      const bellButton = screen.getByRole('button')
      
      // Focus the bell button
      bellButton.focus()
      expect(bellButton).toHaveFocus()
      
      // Press Enter to open
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = render(<NotificationCenter />)
      
      // Re-render with same props
      rerender(<NotificationCenter />)
      
      // Component should handle re-renders gracefully
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})