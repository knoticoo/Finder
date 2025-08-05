import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProviderProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteAccount: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserStats: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map