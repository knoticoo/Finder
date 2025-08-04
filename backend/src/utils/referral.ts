import { prisma } from '../config/database'

export const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  // Generate 8-character code
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

export const generateUniqueReferralCode = async (): Promise<string> => {
  let code: string
  let isUnique = false
  
  while (!isUnique) {
    code = generateReferralCode()
    
    // Check if code already exists
    const existingReferral = await prisma.referral.findUnique({
      where: { referralCode: code }
    })
    
    if (!existingReferral) {
      isUnique = true
    }
  }
  
  return code!
}

export const validateReferralCode = async (code: string): Promise<boolean> => {
  if (!code || code.length !== 8) {
    return false
  }
  
  // Check if code exists and is valid
  const referral = await prisma.referral.findUnique({
    where: { referralCode: code }
  })
  
  return !!(referral && referral.status === 'PENDING')
}

export const getReferralReward = (userRole: string, isReferrer: boolean) => {
  if (userRole === 'PROVIDER') {
    return isReferrer ? 'VISIBILITY_BOOST' : 'VISIBILITY_BOOST'
  } else {
    return isReferrer ? 'PREMIUM_MONTH' : 'PREMIUM_MONTH'
  }
}

export const calculateReferralReward = (rewardType: string, userRole: string) => {
  switch (rewardType) {
    case 'PREMIUM_MONTH':
      return {
        type: 'PREMIUM_SUBSCRIPTION',
        duration: 30, // days
        description: '1 month free premium subscription'
      }
    case 'VISIBILITY_BOOST':
      return {
        type: 'FEATURED_SERVICES',
        duration: 30, // days
        description: 'Services featured in search results for 30 days'
      }
    case 'COMMISSION':
      return {
        type: 'CASH_REWARD',
        amount: 5.00, // EUR
        description: '€5 cash reward'
      }
    case 'DISCOUNT':
      return {
        type: 'DISCOUNT_CODE',
        percentage: 10, // %
        description: '10% discount on next booking'
      }
    default:
      return null
  }
}