'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { userAPI } from '@/lib/api'

const profileSchema = z.object({
  firstName: z.string().min(2, 'Vārds jābūt vismaz 2 simboli').max(50, 'Vārds nevar būt garāks par 50 simboliem'),
  lastName: z.string().min(2, 'Uzvārds jābūt vismaz 2 simboli').max(50, 'Uzvārds nevar būt garāks par 50 simboliem'),
  email: z.string().email('Lūdzu ievadiet derīgu e-pasta adresi'),
  phone: z.string().optional(),
  language: z.enum(['LATVIAN', 'RUSSIAN', 'ENGLISH']),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function CustomerProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile()
        if (response.data.success) {
          const userData = response.data.data
          setUser(userData)
          reset({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            language: userData.language || 'LATVIAN',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [reset])

  const onSubmit = async (data: ProfileForm) => {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await userAPI.updateProfile(data)
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profils veiksmīgi atjaunināts!' })
        
        // Update local storage user data
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const updatedUser = { ...currentUser, ...data }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
      }
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Neizdevās atjaunināt profilu. Lūdzu mēģiniet vēlreiz.' 
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Mans Profilis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Pārvaldiet savu personīgo informāciju un iestatījumus.
          </p>
        </div>

        <div className="px-6 py-6">
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personīgā informācija</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Vārds
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('firstName')}
                      type="text"
                      id="firstName"
                      className={`block w-full px-3 py-2 pl-10 border ${
                        errors.firstName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Jūsu vārds"
                    />
                    <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Uzvārds
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('lastName')}
                      type="text"
                      id="lastName"
                      className={`block w-full px-3 py-2 pl-10 border ${
                        errors.lastName ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Jūsu uzvārds"
                    />
                    <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  E-pasta adrese
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className={`block w-full px-3 py-2 pl-10 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="jūsu@email.com"
                  />
                  <EnvelopeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="mt-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Tālrunis (nav obligāts)
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('phone')}
                    type="tel"
                    id="phone"
                    className={`block w-full px-3 py-2 pl-10 border ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="+371 20000000"
                  />
                  <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Iestatījumi</h3>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Valoda
                </label>
                <div className="mt-1 relative">
                  <select
                    {...register('language')}
                    id="language"
                    className="block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LATVIAN">Latviešu</option>
                    <option value="RUSSIAN">Русский</option>
                    <option value="ENGLISH">English</option>
                  </select>
                  <GlobeAltIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Konta informācija</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Konta ID</p>
                    <p className="text-sm text-gray-900">{user?.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reģistrējies</p>
                    <p className="text-sm text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('lv-LV') : 'Nav zināms'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Konta tips</p>
                    <p className="text-sm text-gray-900">Klients</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Statuss</p>
                    <p className="text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Aktīvs
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saglabāšana...
                  </>
                ) : (
                  'Saglabāt izmaiņas'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}