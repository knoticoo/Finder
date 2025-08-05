import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
export declare const createReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getServiceReviews: (req: Request, res: Response) => Promise<void>;
export declare const getProviderReviews: (req: Request, res: Response) => Promise<void>;
export declare const updateReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const respondToReview: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=reviewController.d.ts.map