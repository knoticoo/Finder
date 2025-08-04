import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validateReferral } from '../middleware/validation'
import {
  generateReferralCode,
  applyReferralCode,
  completeVerificationStep,
  getReferralStatus
} from '../controllers/referralController'

const router = Router()

// Protected routes
router.post('/generate', authenticate, generateReferralCode)
router.post('/apply', authenticate, validateReferral, applyReferralCode)
router.post('/verify-step', authenticate, completeVerificationStep)
router.get('/status', authenticate, getReferralStatus)

export default router