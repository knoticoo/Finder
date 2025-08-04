import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validateSubscription } from '../middleware/validation'
import {
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionPlans,
  checkPremiumFeatures
} from '../controllers/subscriptionController'

const router = Router()

// Public routes
router.get('/plans', getSubscriptionPlans)

// Protected routes
router.get('/', authenticate, getSubscription)
router.post('/', authenticate, validateSubscription, createSubscription)
router.put('/', authenticate, validateSubscription, updateSubscription)
router.delete('/', authenticate, cancelSubscription)
router.get('/premium-features', authenticate, checkPremiumFeatures)

export default router