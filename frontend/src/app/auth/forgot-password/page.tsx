'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { WrenchScrewdriverIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { authAPI } from '@/lib/api'

const forgotPasswordSchema = z.object({
  email: z.string().email('Lūdzu ievadiet derīgu e-pasta adresi'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await authAPI.forgotPassword(data)
      
      if (response.data.success) {
        setSuccess('Paroles atjaunošanas saite ir nosūtīta uz jūsu e-pasta adresi. Lūdzu pārbaudiet savu e-pastu.')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Neizdevās nosūtīt paroles atjaunošanas saiti. Lūdzu mēģiniet vēlreiz.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <WrenchScrewdriverIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Aizmirsi paroli?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ievadiet savu e-pasta adresi un mēs nosūtīsim jums saiti paroles atjaunošanai.
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
              <div className="flex">
                <EnvelopeIcon className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <p className="font-medium">E-pasts nosūtīts!</p>
                  <p className="text-sm mt-1">{success}</p>
                </div>
              </div>
            </div>
          )}

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

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Nosūtīšana...
                </div>
              ) : (
                'Nosūtīt paroles atjaunošanas saiti'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Atgriezties pie ielogošanās
            </Link>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-500">
                Vai nepieciešama palīdzība?
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ja jums ir problēmas, sazinieties ar mūsu{' '}
              <Link href="/contact" className="font-medium text-blue-600 hover:text-blue-500">
                atbalsta komandu
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}