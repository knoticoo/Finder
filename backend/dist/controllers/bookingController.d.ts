import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
export declare const createBooking: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserBookings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProviderBookings: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getBookingById: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateBookingStatus: (req: AuthRequest, res: Response) => Promise<void>;
export declare const cancelBooking: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=bookingController.d.ts.map