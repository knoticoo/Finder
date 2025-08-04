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
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  WrenchScrewdriverIcon,
  CurrencyEuroIcon
} from '@heroicons/react/24/outline'
import { userAPI } from '@/lib/api'

const providerProfileSchema = z.object({
  firstName: z.string().min(2, 'Vārds jābūt vismaz 2 simboli').max(50, 'Vārds nevar būt garāks par 50 simboliem'),
  lastName: z.string().min(2, 'Uzvārds jābūt vismaz 2 simboli').max(50, 'Uzvārds nevar būt garāks par 50 simboliem'),
  email: z.string().email('Lūdzu ievadiet derīgu e-pasta adresi'),
  phone: z.string().optional(),
  language: z.enum(['LATVIAN', 'RUSSIAN', 'ENGLISH']),
  // Provider-specific fields
  businessName: z.string().min(2, 'Uzņēmuma nosaukums jābūt vismaz 2 simboli').max(100, 'Uzņēmuma nosaukums nevar būt garāks par 100 simboliem'),
  businessDescription: z.string().min(10, 'Apraksts jābūt vismaz 10 simboli').max(500, 'Apraksts nevar būt garāks par 500 simboliem'),
  businessAddress: z.string().min(5, 'Adrese jābūt vismaz 5 simboli'),
  businessCity: z.string().min(2, 'Pilsēta jābūt vismaz 2 simboli'),
  businessPostalCode: z.string().min(4, 'Pasta indekss jābūt vismaz 4 simboli'),
  businessPhone: z.string().optional(),
  businessWebsite: z.string().url('Lūdzu ievadiet derīgu URL').optional().or(z.literal('')),
  serviceAreas: z.array(z.string()).min(1, 'Jāizvēlas vismaz viens apkalpošanas apgabals'),
  specializations: z.array(z.string()).optional(),
  experience: z.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']),
  availability: z.enum(['FULL_TIME', 'PART_TIME', 'WEEKENDS', 'ON_DEMAND']),
  hourlyRate: z.number().min(1, 'Stundas maksa jābūt vismaz 1€'),
  currency: z.enum(['EUR', 'USD']).default('EUR'),
})

type ProviderProfileForm = z.infer<typeof providerProfileSchema>

export default function ProviderProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProviderProfileForm>({
    resolver: zodResolver(providerProfileSchema),
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
            businessName: userData.providerProfile?.businessName || '',
            businessDescription: userData.providerProfile?.businessDescription || '',
            businessAddress: userData.providerProfile?.businessAddress || '',
            businessCity: userData.providerProfile?.businessCity || '',
            businessPostalCode: userData.providerProfile?.businessPostalCode || '',
            businessPhone: userData.providerProfile?.businessPhone || '',
            businessWebsite: userData.providerProfile?.businessWebsite || '',
            serviceAreas: userData.providerProfile?.serviceAreas || [],
            specializations: userData.providerProfile?.specializations || [],
            experience: userData.providerProfile?.experience || 'INTERMEDIATE',
            availability: userData.providerProfile?.availability || 'FULL_TIME',
            hourlyRate: userData.providerProfile?.hourlyRate || 15,
            currency: userData.providerProfile?.currency || 'EUR',
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

  const onSubmit = async (data: ProviderProfileForm) => {
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await userAPI.updateProviderProfile(data)

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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Sniedzēja Profils</h1>
          <p className="mt-1 text-sm text-gray-600">
            Pārvaldiet savu biznesa informāciju un iestatījumus
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Biznesa informācija</h3>

              <div className="mt-6">
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Uzņēmuma nosaukums
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('businessName')}
                    type="text"
                    id="businessName"
                    className={`block w-full px-3 py-2 pl-10 border ${
                      errors.businessName ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Jūsu uzņēmuma nosaukums"
                  />
                  <BuildingOfficeIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                )}
              </div>

              <div className="mt-6">
                <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
                  Uzņēmuma apraksts
                </label>
                <div className="mt-1">
                  <textarea
                    {...register('businessDescription')}
                    id="businessDescription"
                    rows={4}
                    className={`block w-full px-3 py-2 border ${
                      errors.businessDescription ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Īss apraksts par jūsu uzņēmumu un piedāvātajiem pakalpojumiem..."
                  />
                </div>
                {errors.businessDescription && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessDescription.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                    Adrese
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('businessAddress')}
                      type="text"
                      id="businessAddress"
                      className={`block w-full px-3 py-2 pl-10 border ${
                        errors.businessAddress ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Ielas nosaukums, numurs"
                    />
                    <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.businessAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessAddress.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessCity" className="block text-sm font-medium text-gray-700">
                    Pilsēta
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('businessCity')}
                      type="text"
                      id="businessCity"
                      className={`block w-full px-3 py-2 pl-10 border ${
                        errors.businessCity ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="Rīga"
                    />
                    <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.businessCity && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessCity.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="businessPostalCode" className="block text-sm font-medium text-gray-700">
                    Pasta indekss
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('businessPostalCode')}
                      type="text"
                      id="businessPostalCode"
                      className={`block w-full px-3 py-2 pl-10 border ${
                        errors.businessPostalCode ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="LV-1001"
                    />
                    <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.businessPostalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessPostalCode.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
                    Biznesa tālrunis (nav obligāts)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('businessPhone')}
                      type="tel"
                      id="businessPhone"
                      className={`block w-full px-3 py-2 pl-10 border ${
                        errors.businessPhone ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="+371 20000000"
                    />
                    <PhoneIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.businessPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessPhone.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700">
                  Mājas lapa (nav obligāta)
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('businessWebsite')}
                    type="url"
                    id="businessWebsite"
                    className={`block w-full px-3 py-2 pl-10 border ${
                      errors.businessWebsite ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="https://www.example.com"
                  />
                  <GlobeAltIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                {errors.businessWebsite && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessWebsite.message}</p>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profesionālā informācija</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                    Pieredze
                  </label>
                  <div className="mt-1">
                    <select
                      {...register('experience')}
                      id="experience"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="BEGINNER">Iesācējs (0-2 gadi)</option>
                      <option value="INTERMEDIATE">Vidēja līmeņa (2-5 gadi)</option>
                      <option value="EXPERT">Eksperts (5+ gadi)</option>
                    </select>
                  </div>
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                    Pieejamība
                  </label>
                  <div className="mt-1">
                    <select
                      {...register('availability')}
                      id="availability"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="FULL_TIME">Pilna laika</option>
                      <option value="PART_TIME">Daļa laika</option>
                      <option value="WEEKENDS">Tikai nedēļas nogalēs</option>
                      <option value="ON_DEMAND">Pēc pieprasījuma</option>
                    </select>
                  </div>
                  {errors.availability && (
                    <p className="mt-1 text-sm text-red-600">{errors.availability.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
                    Stundas maksa (€)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('hourlyRate', { valueAsNumber: true })}
                      type="number"
                      id="hourlyRate"
                      min="1"
                      step="0.01"
                      className={`block w-full px-3 py-2 pl-10 border ${
                        errors.hourlyRate ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      placeholder="15.00"
                    />
                    <CurrencyEuroIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  {errors.hourlyRate && (
                    <p className="mt-1 text-sm text-red-600">{errors.hourlyRate.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Valūta
                  </label>
                  <div className="mt-1">
                    <select
                      {...register('currency')}
                      id="currency"
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="EUR">EUR (Euro)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>
                  {errors.currency && (
                    <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                  )}
                </div>
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
                    <p className="text-sm text-gray-900">Pakalpojumu sniedzējs</p>
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