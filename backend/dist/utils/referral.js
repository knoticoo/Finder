"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateReferralReward = exports.getReferralReward = exports.validateReferralCode = exports.generateUniqueReferralCode = exports.generateReferralCode = void 0;
const database_1 = require("../config/database");
const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateReferralCode = generateReferralCode;
const generateUniqueReferralCode = async () => {
    let code;
    let isUnique = false;
    while (!isUnique) {
        code = (0, exports.generateReferralCode)();
        const existingReferral = await database_1.prisma.referral.findUnique({
            where: { referralCode: code }
        });
        if (!existingReferral) {
            isUnique = true;
        }
    }
    return code;
};
exports.generateUniqueReferralCode = generateUniqueReferralCode;
const validateReferralCode = async (code) => {
    if (!code || code.length !== 8) {
        return false;
    }
    const referral = await database_1.prisma.referral.findUnique({
        where: { referralCode: code }
    });
    return !!(referral && referral.status === 'PENDING');
};
exports.validateReferralCode = validateReferralCode;
const getReferralReward = (userRole, isReferrer) => {
    if (userRole === 'PROVIDER') {
        return isReferrer ? 'VISIBILITY_BOOST' : 'VISIBILITY_BOOST';
    }
    else {
        return isReferrer ? 'PREMIUM_MONTH' : 'PREMIUM_MONTH';
    }
};
exports.getReferralReward = getReferralReward;
const calculateReferralReward = (rewardType, userRole) => {
    switch (rewardType) {
        case 'PREMIUM_MONTH':
            return {
                type: 'PREMIUM_SUBSCRIPTION',
                duration: 30,
                description: '1 month free premium subscription'
            };
        case 'VISIBILITY_BOOST':
            return {
                type: 'FEATURED_SERVICES',
                duration: 30,
                description: 'Services featured in search results for 30 days'
            };
        case 'COMMISSION':
            return {
                type: 'CASH_REWARD',
                amount: 5.00,
                description: '€5 cash reward'
            };
        case 'DISCOUNT':
            return {
                type: 'DISCOUNT_CODE',
                percentage: 10,
                description: '10% discount on next booking'
            };
        default:
            return null;
    }
};
exports.calculateReferralReward = calculateReferralReward;
//# sourceMappingURL=referral.js.map