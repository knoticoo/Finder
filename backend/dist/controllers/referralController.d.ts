import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const generateReferralCode: (req: AuthRequest, res: Response) => Promise<void>;
export declare const applyReferralCode: (req: AuthRequest, res: Response) => Promise<void>;
export declare const completeVerificationStep: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getReferralStatus: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=referralController.d.ts.map