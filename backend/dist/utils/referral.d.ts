export declare const generateReferralCode: () => string;
export declare const generateUniqueReferralCode: () => Promise<string>;
export declare const validateReferralCode: (code: string) => Promise<boolean>;
export declare const getReferralReward: (userRole: string, isReferrer: boolean) => "PREMIUM_MONTH" | "VISIBILITY_BOOST";
export declare const calculateReferralReward: (rewardType: string, userRole: string) => {
    type: string;
    duration: number;
    description: string;
    amount?: undefined;
    percentage?: undefined;
} | {
    type: string;
    amount: number;
    description: string;
    duration?: undefined;
    percentage?: undefined;
} | {
    type: string;
    percentage: number;
    description: string;
    duration?: undefined;
    amount?: undefined;
};
//# sourceMappingURL=referral.d.ts.map