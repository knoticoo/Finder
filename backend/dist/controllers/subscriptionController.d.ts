import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelSubscription: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSubscriptionPlans: (req: Request, res: Response) => Promise<void>;
export declare const checkPremiumFeatures: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=subscriptionController.d.ts.map