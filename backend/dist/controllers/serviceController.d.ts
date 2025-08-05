import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
export declare const getAllServices: (req: Request, res: Response) => Promise<void>;
export declare const getServiceById: (req: Request, res: Response) => Promise<void>;
export declare const createService: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateService: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteService: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getServiceCategories: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=serviceController.d.ts.map