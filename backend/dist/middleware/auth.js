"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerified = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("@/utils/jwt");
const database_1 = require("@/config/database");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                isActive: true,
                isVerified: true
            }
        });
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'User not found or inactive'
            });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const requireVerified = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
        return;
    }
    if (req.user.role === 'PROVIDER') {
        database_1.prisma.providerProfile.findUnique({
            where: { userId: req.user.id },
            select: { isVerified: true }
        }).then(profile => {
            if (!profile?.isVerified) {
                res.status(403).json({
                    success: false,
                    message: 'Provider account must be verified'
                });
                return;
            }
            next();
        }).catch(() => {
            res.status(403).json({
                success: false,
                message: 'Provider account must be verified'
            });
        });
    }
    else {
        next();
    }
};
exports.requireVerified = requireVerified;
//# sourceMappingURL=auth.js.map