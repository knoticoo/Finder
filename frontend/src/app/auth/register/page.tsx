'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon, WrenchScrewdriverIcon, UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { authAPI } from '@/lib/api'
import LanguageSwitcher from '@/components/language/LanguageSwitcher'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Vārds jābūt vismaz 2 simboli').max(50, 'Vārds nevar būt garāks par 50 simboliem'),
  lastName: z.string().min(2, 'Uzvārds jābūt vismaz 2 simboli').max(50, 'Uzvārds nevar būt garāks par 50 simboliem'),
  email: z.string().email('Lūdzu ievadiet derīgu e-pasta adresi'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Parolei jābūt vismaz 8 simboli')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Parolei jābūt vismaz viena mazā burta, viena lielā burta un viena cipara'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'PROVIDER']),
  language: z.enum(['LATVIAN', 'RUSSIAN', 'ENGLISH']).default('LATVIAN'),
  agreeToTerms: z.boolean().refine(val => val === true, 'Jums jāpiekrīt lietošanas noteikumiem'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Paroles nesakrīt",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // Extract current locale from pathname or default to 'lv'
  const currentLocale = pathname.match(/^\/([a-z]{2})/)?.[1] || 'lv'
  const defaultRole = searchParams.get('role') as 'CUSTOMER' | 'PROVIDER' || 'CUSTOMER'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
      language: 'LATVIAN',
    },
  })

  const selectedRole = watch('role')
  const selectedLanguage = watch('language')

  // Handle language change to switch page language
  const handleLanguageChange = (newLang: string) => {
    const langMap: { [key: string]: string } = {
      'LATVIAN': 'lv',
      'RUSSIAN': 'ru', 
      'ENGLISH': 'en'
    }
    const localeCode = langMap[newLang] || 'lv'
    
    // Remove current locale from pathname and add new one
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '')
    const newPath = `/${localeCode}${pathWithoutLocale}`
    router.push(newPath)
  }

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await authAPI.register(data)
      
      if (response.data.success) {
        setSuccess('Reģistrācija veiksmīga! Jūs varat tagad ielogoties.')
        
        // Auto-login after successful registration
        const loginResponse = await authAPI.login({
          email: data.email,
          password: data.password,
        })
        
        if (loginResponse.data.success) {
          localStorage.setItem('token', loginResponse.data.token)
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user))
          
          // Redirect based on user role
          if (data.role === 'PROVIDER') {
            router.push('/dashboard/provider')
          } else {
            router.push('/dashboard/customer')
          }
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Reģistrācija neizdevās. Lūdzu mēģiniet vēlreiz.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1"></div>
            <div className="flex justify-center flex-1">
              <WrenchScrewdriverIcon className="h-12 w-12 text-blue-600" />
            </div>
            <div className="flex-1 flex justify-end">
              <LanguageSwitcher currentLocale={currentLocale} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Izveidot kontu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Vai jau ir konts?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Ieiet
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Es vēlos reģistrēties kā:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                selectedRole === 'CUSTOMER' 
                  ? 'border-blue-500 ring-2 ring-blue-500' 
                  : 'border-gray-300'
              }`}>
                <input
                  {...register('role')}
                  type="radio"
                  value="CUSTOMER"
                  className="sr-only"
                />
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm font-medium text-gray-900">Klients</span>
                </div>
              </label>

              <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                selectedRole === 'PROVIDER' 
                  ? 'border-blue-500 ring-2 ring-blue-500' 
                  : 'border-gray-300'
              }`}>
                <input
                  {...register('role')}
                  type="radio"
                  value="PROVIDER"
                  className="sr-only"
                />
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-3 text-sm font-medium text-gray-900">Sniedzējs</span>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Vārds
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  id="firstName"
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Jūsu vārds"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Uzvārds
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  id="lastName"
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Jūsu uzvārds"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-pasta adrese
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="jūsu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Tālrunis (nav obligāts)
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="+371 20000000"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Parole
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`block w-full px-3 py-2 pr-10 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Vismaz 8 simboli"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Apstiprināt paroli
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`block w-full px-3 py-2 pr-10 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Atkārtot paroli"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Language Preference */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Valoda
              </label>
              <select
                {...register('language')}
                id="language"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => {
                  // Update form value
                  const newValue = e.target.value as 'LATVIAN' | 'RUSSIAN' | 'ENGLISH'
                  // Trigger language change
                  handleLanguageChange(newValue)
                }}
              >
                <option value="LATVIAN">Latviešu</option>
                <option value="RUSSIAN">Русский</option>
                <option value="ENGLISH">English</option>
              </select>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  {...register('agreeToTerms')}
                  id="agreeToTerms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeToTerms" className="text-gray-700">
                  Es piekrītu{' '}
                  <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    lietošanas noteikumiem
                  </Link>{' '}
                  un{' '}
                  <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    privātuma politikai
                  </Link>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Reģistrēšanās...
                </div>
              ) : (
                'Reģistrēties'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-500">
                  Vai turpināt ar
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Ielādē...</p>
        </div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}