import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
export declare const sendMessage: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getConversation: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserConversations: (req: AuthRequest, res: Response) => Promise<void>;
export declare const markAsRead: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteMessage: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=messageController.d.ts.map