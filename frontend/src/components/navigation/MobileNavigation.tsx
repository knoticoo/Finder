'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface MobileNavigationProps {
  user: any
}

export default function MobileNavigation({ user }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const isProvider = user?.role === 'PROVIDER'

  const navigation = isProvider ? [
    { name: 'Pārskats', href: '/dashboard/provider', icon: HomeIcon },
    { name: 'Mani Pakalpojumi', href: '/dashboard/provider/services', icon: WrenchScrewdriverIcon },
    { name: 'Rezervācijas', href: '/dashboard/provider/bookings', icon: CalendarIcon },
    { name: 'Atsauksmes', href: '/dashboard/provider/reviews', icon: StarIcon },
    { name: 'Ziņojumi', href: '/dashboard/provider/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Profilis', href: '/dashboard/provider/profile', icon: UserIcon },
  ] : [
    { name: 'Pārskats', href: '/dashboard/customer', icon: HomeIcon },
    { name: 'Mani Rezervācijas', href: '/dashboard/customer/bookings', icon: CalendarIcon },
    { name: 'Mani Atsauksmes', href: '/dashboard/customer/reviews', icon: StarIcon },
    { name: 'Ziņojumi', href: '/dashboard/customer/messages', icon: ChatBubbleLeftRightIcon },
    { name: 'Profilis', href: '/dashboard/customer/profile', icon: UserIcon },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded="false"
      >
        <span className="sr-only">Atvērt galveno izvēlni</span>
        {isOpen ? (
          <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
        ) : (
          <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              
              {/* User info */}
              <div className="flex-shrink-0 flex items-center px-4 py-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isProvider ? 'Pakalpojumu sniedzējs' : 'Klients'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-3 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-blue-100 text-blue-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon
                          className={`mr-4 h-6 w-6 ${
                            isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Bottom actions */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center space-x-4 w-full">
                  <button className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    <BellIcon className="h-5 w-5 mr-2" />
                    Paziņojumi
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <CogIcon className="h-5 w-5 mr-2" />
                    Iziet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}