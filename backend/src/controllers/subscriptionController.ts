import { Request, Response } from 'express'
import { prisma } from '../config/database'
import { AuthRequest } from '../middleware/auth'

export const getSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
      return
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: subscription || {
        userId: req.user.id,
        planType: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: null,
        currentPeriodEnd: null
      }
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const createSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
      return
    }

    const { planType, stripeCustomerId, stripeSubscriptionId } = req.body

    // Check if user already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    })

    if (existingSubscription) {
      res.status(400).json({
        success: false,
        message: 'User already has a subscription'
      })
      return
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        planType,
        stripeCustomerId,
        stripeSubscriptionId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const updateSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
      return
    }

    const { planType, status, stripeCustomerId, stripeSubscriptionId, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd } = req.body

    const subscription = await prisma.subscription.update({
      where: { userId: req.user.id },
      data: {
        planType,
        status,
        stripeCustomerId,
        stripeSubscriptionId,
        currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart) : null,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : null,
        cancelAtPeriodEnd
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const cancelSubscription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
      return
    }

    const subscription = await prisma.subscription.update({
      where: { userId: req.user.id },
      data: {
        status: 'CANCELLED',
        cancelAtPeriodEnd: true
      }
    })

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const getSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = [
      {
        id: 'FREE',
        name: 'Free',
        nameLv: 'Bezmaksas',
        nameRu: 'Бесплатный',
        nameEn: 'Free',
        price: 0,
        currency: 'EUR',
        features: [
          'Basic service listings',
          'Standard search visibility',
          'Basic customer support'
        ],
        featuresLv: [
          'Pamatpakalpojumu saraksts',
          'Standarta meklēšanas redzamība',
          'Pamata klientu atbalsts'
        ],
        featuresRu: [
          'Базовые объявления услуг',
          'Стандартная видимость в поиске',
          'Базовая поддержка клиентов'
        ],
        featuresEn: [
          'Basic service listings',
          'Standard search visibility',
          'Basic customer support'
        ]
      },
      {
        id: 'BASIC',
        name: 'Basic',
        nameLv: 'Pamata',
        nameRu: 'Базовый',
        nameEn: 'Basic',
        price: 9.99,
        currency: 'EUR',
        features: [
          'Priority search visibility',
          'Enhanced profile features',
          'Basic analytics',
          'Priority customer support'
        ],
        featuresLv: [
          'Prioritāte meklēšanā',
          'Uzlabotas profila funkcijas',
          'Pamata analīze',
          'Prioritāte klientu atbalstā'
        ],
        featuresRu: [
          'Приоритетная видимость в поиске',
          'Расширенные функции профиля',
          'Базовая аналитика',
          'Приоритетная поддержка клиентов'
        ],
        featuresEn: [
          'Priority search visibility',
          'Enhanced profile features',
          'Basic analytics',
          'Priority customer support'
        ]
      },
      {
        id: 'PREMIUM',
        name: 'Premium',
        nameLv: 'Premium',
        nameRu: 'Премиум',
        nameEn: 'Premium',
        price: 19.99,
        currency: 'EUR',
        features: [
          'Top search results',
          'Verified badge',
          'Advanced analytics',
          'Priority customer support',
          'Featured in category pages',
          'Enhanced profile customization'
        ],
        featuresLv: [
          'Top meklēšanas rezultāti',
          'Verificēta zīme',
          'Uzlabota analīze',
          'Prioritāte klientu atbalstā',
          'Iekļauts kategoriju lapās',
          'Uzlabota profila pielāgošana'
        ],
        featuresRu: [
          'Топ результаты поиска',
          'Значок верификации',
          'Расширенная аналитика',
          'Приоритетная поддержка клиентов',
          'Рекомендуемые в категориях',
          'Расширенная настройка профиля'
        ],
        featuresEn: [
          'Top search results',
          'Verified badge',
          'Advanced analytics',
          'Priority customer support',
          'Featured in category pages',
          'Enhanced profile customization'
        ]
      },
      {
        id: 'ENTERPRISE',
        name: 'Enterprise',
        nameLv: 'Uzņēmums',
        nameRu: 'Предприятие',
        nameEn: 'Enterprise',
        price: 49.99,
        currency: 'EUR',
        features: [
          'All Premium features',
          'Dedicated account manager',
          'Custom integrations',
          'White-label options',
          'API access',
          'Priority onboarding'
        ],
        featuresLv: [
          'Visas Premium funkcijas',
          'Dedzēts konta vadītājs',
          'Pielāgotas integrācijas',
          'White-label iespējas',
          'API piekļuve',
          'Prioritāte onboarding'
        ],
        featuresRu: [
          'Все функции Premium',
          'Персональный менеджер',
          'Индивидуальные интеграции',
          'White-label опции',
          'API доступ',
          'Приоритетная адаптация'
        ],
        featuresEn: [
          'All Premium features',
          'Dedicated account manager',
          'Custom integrations',
          'White-label options',
          'API access',
          'Priority onboarding'
        ]
      }
    ]

    res.json({
      success: true,
      data: plans
    })
  } catch (error) {
    console.error('Get subscription plans error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const checkPremiumFeatures = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
      return
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    })

    const hasPremium = subscription && 
      subscription.status === 'ACTIVE' && 
      ['PREMIUM', 'ENTERPRISE'].includes(subscription.planType)

    const hasBasic = subscription && 
      subscription.status === 'ACTIVE' && 
      ['BASIC', 'PREMIUM', 'ENTERPRISE'].includes(subscription.planType)

    res.json({
      success: true,
      data: {
        hasPremium,
        hasBasic,
        subscription: subscription || { planType: 'FREE', status: 'ACTIVE' }
      }
    })
  } catch (error) {
    console.error('Check premium features error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}