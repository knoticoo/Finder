'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN'
  isVerified: boolean
  isActive: boolean
  createdAt: string
}

interface Service {
  id: string
  title: string
  description: string
  price: number
  category: string
  isActive: boolean
  isApproved: boolean
  provider: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
}

interface AdminStats {
  totalUsers: number
  totalProviders: number
  totalServices: number
  pendingServices: number
  totalBookings: number
  revenueThisMonth: number
}

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'services' | 'reports' | 'settings'>('dashboard')
  const [users, setUsers] = useState<User[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalServices: 0,
    pendingServices: 0,
    totalBookings: 0,
    revenueThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Check admin access
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/auth/login')
    }
  }, [user, isAuthenticated, isLoading, router])

  // Load admin data
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAdminData()
    }
  }, [user])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - replace with actual API calls
      setStats({
        totalUsers: 150,
        totalProviders: 45,
        totalServices: 128,
        pendingServices: 12,
        totalBookings: 234,
        revenueThisMonth: 12450
      })

      setUsers([
        {
          id: '1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER',
          isVerified: true,
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          email: 'jane.provider@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'PROVIDER',
          isVerified: true,
          isActive: true,
          createdAt: '2024-01-10T14:30:00Z'
        },
        {
          id: '3',
          email: 'pending.user@example.com',
          firstName: 'Pending',
          lastName: 'User',
          role: 'PROVIDER',
          isVerified: false,
          isActive: false,
          createdAt: '2024-01-20T09:15:00Z'
        }
      ])

      setServices([
        {
          id: '1',
          title: 'Professional House Cleaning',
          description: 'Complete house cleaning service',
          price: 85,
          category: 'Cleaning',
          isActive: true,
          isApproved: true,
          provider: {
            firstName: 'Anna',
            lastName: 'Cleaner',
            email: 'anna@example.com'
          },
          createdAt: '2024-01-18T11:00:00Z'
        },
        {
          id: '2',
          title: 'Plumbing Repairs',
          description: 'All types of plumbing repairs',
          price: 120,
          category: 'Home Repair',
          isActive: false,
          isApproved: false,
          provider: {
            firstName: 'Bob',
            lastName: 'Plumber',
            email: 'bob@example.com'
          },
          createdAt: '2024-01-22T16:45:00Z'
        }
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: 'verify' | 'suspend' | 'delete') => {
    try {
      // Implement user actions
      console.log(`${action} user ${userId}`)
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              isVerified: action === 'verify' ? true : user.isVerified,
              isActive: action === 'suspend' ? false : user.isActive
            }
          : user
      ))
    } catch (error) {
      console.error(`Error ${action} user:`, error)
    }
  }

  const handleServiceAction = async (serviceId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      // Implement service actions
      console.log(`${action} service ${serviceId}`)
      
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { 
              ...service, 
              isApproved: action === 'approve' ? true : action === 'reject' ? false : service.isApproved,
              isActive: action === 'approve' ? true : action === 'reject' ? false : service.isActive
            }
          : service
      ))
    } catch (error) {
      console.error(`Error ${action} service:`, error)
    }
  }

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.provider.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage VisiPakalpojumi platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.firstName[0]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
                { id: 'users', name: 'Users', icon: UserGroupIcon },
                { id: 'services', name: 'Services', icon: CogIcon },
                { id: 'reports', name: 'Reports', icon: ChartBarIcon },
                { id: 'settings', name: 'Settings', icon: AdjustmentsHorizontalIcon }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Providers</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalProviders}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CogIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Services</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalServices}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Services</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingServices}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Bookings</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalBookings}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 text-green-600 font-bold text-lg">€</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Revenue (This Month)</dt>
                      <dd className="text-lg font-medium text-gray-900">€{stats.revenueThisMonth.toLocaleString()}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">New provider registered: Jane Smith</span>
                    <span className="text-xs text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Service approved: Professional House Cleaning</span>
                    <span className="text-xs text-gray-400">4 hours ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Service pending review: Plumbing Repairs</span>
                    <span className="text-xs text-gray-400">6 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.firstName[0]}{user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'PROVIDER' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {user.isVerified ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Unverified
                            </span>
                          )}
                          {user.isActive ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Suspended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {!user.isVerified && (
                            <button
                              onClick={() => handleUserAction(user.id, 'verify')}
                              className="text-green-600 hover:text-green-900"
                              title="Verify user"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUserAction(user.id, 'suspend')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Suspend user"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="text-red-600 hover:text-red-900"
                            title="Delete user"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div>
            {/* Search and Filters */}
            <div className="mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredServices.map(service => (
                    <tr key={service.id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.title}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{service.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {service.provider.firstName} {service.provider.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{service.provider.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {service.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{service.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {service.isApproved ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                          {service.isActive && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Active
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View service"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {!service.isApproved && (
                            <>
                              <button
                                onClick={() => handleServiceAction(service.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve service"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleServiceAction(service.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject service"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleServiceAction(service.id, 'delete')}
                            className="text-red-600 hover:text-red-900"
                            title="Delete service"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reports Coming Soon</h3>
            <p className="mt-1 text-sm text-gray-500">
              Analytics and reporting features will be available here.
            </p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="text-center py-12">
            <AdjustmentsHorizontalIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Settings Coming Soon</h3>
            <p className="mt-1 text-sm text-gray-500">
              System settings and configuration options will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}