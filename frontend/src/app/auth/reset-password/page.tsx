'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeSlashIcon, WrenchScrewdriverIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { authAPI } from '@/lib/api'

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Parolei jābūt vismaz 8 simboli')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Parolei jābūt vismaz viena mazā burta, viena lielā burta un viena cipara'),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Paroles nesakrīt",
  path: ["confirmPassword"],
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || '',
    },
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await authAPI.resetPassword(data)
      
      if (response.data.success) {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Neizdevās atjaunot paroli. Lūdzu mēģiniet vēlreiz.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-red-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Nederīga saite</h2>
            <p className="mt-2 text-sm text-gray-600">
              Paroles atjaunošanas saite nav derīga vai ir beidzies tās derīguma termiņš.
            </p>
            <div className="mt-6">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Pieprasīt jaunu saiti
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Parole atjaunota!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Jūsu parole ir veiksmīgi atjaunota. Jūs tiksiet novirzīts uz ielogošanās lapu.
            </p>
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Ieiet tagad
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <WrenchScrewdriverIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Iestatīt jaunu paroli
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ievadiet jauno paroli jūsu kontam.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Jaunā parole
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Apstiprināt jauno paroli
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className={`block w-full px-3 py-2 pr-10 border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Atkārtot jauno paroli"
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
                  Atjaunošana...
                </div>
              ) : (
                'Atjaunot paroli'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Atgriezties pie ielogošanās
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}