'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import NotificationCenter from '@/components/NotificationCenter'
import { 
  Bars3Icon, 
  XMarkIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-xl">
                VP
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 hidden sm:block">
                VisiPakalpojumi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/services" className="text-gray-600 hover:text-blue-600 transition-colors">
              Pakalpojumi
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              Par mums
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Kontakti
            </Link>

            {!isAuthenticated ? (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Ieiet
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reģistrēties
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <NotificationCenter />

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                    <span className="hidden lg:block">
                      {user?.firstName} {user?.lastName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        {/* Dashboard Link */}
                        <Link
                          href={`/dashboard/${user?.role?.toLowerCase()}`}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <UserIcon className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>

                        {/* Admin Panel Link (only for admins) */}
                        {user?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <CogIcon className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        )}

                        <div className="border-t border-gray-100"></div>
                        
                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Iziet
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link 
                href="/services" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Pakalpojumi
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Par mums
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Kontakti
              </Link>

              {!isAuthenticated ? (
                <>
                  <Link 
                    href="/auth/login" 
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ieiet
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="block px-3 py-2 bg-blue-600 text-white rounded-lg mx-3 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Reģistrēties
                  </Link>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 border-t border-gray-200 mt-2">
                    <div className="text-sm text-gray-500">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                  
                  <Link
                    href={`/dashboard/${user?.role?.toLowerCase()}`}
                    className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-gray-600 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600"
                  >
                    Iziet
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}