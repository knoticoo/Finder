import { JwtPayload } from '@/types/auth';
export declare const generateToken: (payload: Omit<JwtPayload, "iat" | "exp">) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const decodeToken: (token: string) => JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map