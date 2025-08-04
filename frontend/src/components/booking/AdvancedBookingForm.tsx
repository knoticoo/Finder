'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Service {
  id: string
  title: string
  price: number
  priceType: 'HOURLY' | 'FIXED' | 'PER_UNIT'
  currency: string
  description: string
  provider: {
    id: string
    firstName: string
    lastName: string
    businessName?: string
  }
}

interface AdvancedBookingFormProps {
  service: Service
  onBookingSubmit: (bookingData: BookingFormData) => void
  onCancel: () => void
  loading?: boolean
}

const bookingSchema = z.object({
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postalCode: z.string().min(4, 'Postal code must be at least 4 characters'),
  notes: z.string().optional(),
  specialRequirements: z.string().optional(),
  urgency: z.enum(['normal', 'urgent', 'emergency']),
  preferredContactMethod: z.enum(['phone', 'email', 'message']),
  allowProviderContact: z.boolean(),
  photos: z.array(z.string()).optional(),
  customRequirements: z.array(z.string()).optional()
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function AdvancedBookingForm({ 
  service, 
  onBookingSubmit, 
  onCancel, 
  loading = false 
}: AdvancedBookingFormProps) {
  const t = useTranslations('booking')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [totalAmount, setTotalAmount] = useState(service.price)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [customRequirements, setCustomRequirements] = useState<string[]>([])
  const [newRequirement, setNewRequirement] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      urgency: 'normal',
      preferredContactMethod: 'message',
      allowProviderContact: true,
      duration: 1
    }
  })

  const watchedDuration = watch('duration')
  const watchedUrgency = watch('urgency')

  // Calculate total amount based on duration and urgency
  useEffect(() => {
    let baseAmount = service.price * watchedDuration
    let urgencyMultiplier = 1

    switch (watchedUrgency) {
      case 'urgent':
        urgencyMultiplier = 1.25
        break
      case 'emergency':
        urgencyMultiplier = 1.5
        break
      default:
        urgencyMultiplier = 1
    }

    setTotalAmount(baseAmount * urgencyMultiplier)
  }, [watchedDuration, watchedUrgency, service.price])

  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploadedPhotos(prev => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const addCustomRequirement = () => {
    if (newRequirement.trim()) {
      setCustomRequirements(prev => [...prev, newRequirement.trim()])
      setNewRequirement('')
    }
  }

  const removeCustomRequirement = (index: number) => {
    setCustomRequirements(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = (data: BookingFormData) => {
    const bookingData = {
      ...data,
      photos: uploadedPhotos,
      customRequirements,
      totalAmount
    }
    onBookingSubmit(bookingData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('lv-LV', {
      style: 'currency',
      currency: service.currency
    }).format(amount)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">{t('bookService')}</h2>
        <p className="text-sm text-gray-600 mt-1">{service.title}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Service Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('serviceDetails')}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">{t('provider')}:</span>
              <p className="font-medium">{service.provider.businessName || `${service.provider.firstName} ${service.provider.lastName}`}</p>
            </div>
            <div>
              <span className="text-gray-600">{t('basePrice')}:</span>
              <p className="font-medium">{formatCurrency(service.price)}</p>
            </div>
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('scheduling')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('date')} *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('scheduledDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('time')} *
              </label>
              <div className="relative">
                <ClockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...register('scheduledTime')}
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('selectTime')}</option>
                  {generateTimeSlots().map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              {errors.scheduledTime && (
                <p className="mt-1 text-sm text-red-600">{errors.scheduledTime.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('duration')} ({t('hours')}) *
            </label>
            <input
              type="number"
              min="1"
              max="24"
              {...register('duration', { valueAsNumber: true })}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('urgency')}
            </label>
            <select
              {...register('urgency')}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="normal">{t('normal')}</option>
              <option value="urgent">{t('urgent')} (+25%)</option>
              <option value="emergency">{t('emergency')} (+50%)</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('location')}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('address')} *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                {...register('address')}
                placeholder={t('addressPlaceholder')}
                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('city')} *
              </label>
              <input
                type="text"
                {...register('city')}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('postalCode')} *
              </label>
              <input
                type="text"
                {...register('postalCode')}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('additionalRequirements')}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('notes')}
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder={t('notesPlaceholder')}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('specialRequirements')}
            </label>
            <textarea
              {...register('specialRequirements')}
              rows={3}
              placeholder={t('specialRequirementsPlaceholder')}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Custom Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('customRequirements')}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                placeholder={t('addRequirement')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={addCustomRequirement}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('add')}
              </button>
            </div>
            {customRequirements.length > 0 && (
              <div className="space-y-2">
                {customRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm">{requirement}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomRequirement(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('photos')}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">{t('uploadPhotos')}</p>
                </div>
              </label>
            </div>
            {uploadedPhotos.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">{t('contactPreferences')}</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('preferredContactMethod')}
            </label>
            <select
              {...register('preferredContactMethod')}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="message">{t('inAppMessage')}</option>
              <option value="phone">{t('phone')}</option>
              <option value="email">{t('email')}</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('allowProviderContact')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              {t('allowProviderContact')}
            </label>
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-900">{t('totalAmount')}</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {t('includesUrgencyFee')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t('processing') : t('confirmBooking')}
          </button>
        </div>
      </form>
    </div>
  )
}