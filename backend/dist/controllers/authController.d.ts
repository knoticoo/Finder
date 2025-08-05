import { Request, Response } from 'express';
export declare const register: (req: Request, res: Response) => Promise<void>;
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const requestPasswordReset: (req: Request, res: Response) => Promise<void>;
export declare const confirmPasswordReset: (_req: Request, res: Response) => Promise<void>;
export declare const verifyEmail: (_req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (_req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map