"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_session_1 = __importDefault(require("express-session"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const passport_1 = __importDefault(require("./config/passport"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const services_1 = __importDefault(require("./routes/services"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const messages_1 = __importDefault(require("./routes/messages"));
const subscriptions_1 = __importDefault(require("./routes/subscriptions"));
const referrals_1 = __importDefault(require("./routes/referrals"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const notifications_2 = require("./controllers/notifications");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env['NODE_ENV'] === 'production' ? '*' : (process.env['FRONTEND_URL'] || 'http://localhost:3000'),
        methods: ['GET', 'POST']
    }
});
const PORT = process.env['PORT'] || 3001;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env['NODE_ENV'] === 'production' ? '*' : (process.env['FRONTEND_URL'] || 'http://localhost:3000'),
    credentials: true
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
if (process.env['NODE_ENV'] === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.get('/', (_req, res) => {
    res.status(200).json({
        message: 'Welcome to Finder API',
        version: process.env['npm_package_version'] || '1.0.0',
        environment: process.env['NODE_ENV'],
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users',
            services: '/api/services',
            bookings: '/api/bookings',
            reviews: '/api/reviews',
            messages: '/api/messages',
            subscriptions: '/api/subscriptions',
            referrals: '/api/referrals'
        }
    });
});
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env['NODE_ENV'],
        version: process.env['npm_package_version'] || '1.0.0'
    });
});
app.get('/favicon.ico', (_req, res) => {
    res.status(204).end();
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/services', services_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/messages', messages_1.default);
app.use('/api/subscriptions', subscriptions_1.default);
app.use('/api/referrals', referrals_1.default);
app.use('/api/notifications', notifications_1.default);
(0, notifications_2.setSocketIO)(io);
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });
    socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
        console.log(`User ${socket.id} left room ${roomId}`);
    });
    socket.on('send-message', (data) => {
        socket.to(data.roomId).emit('receive-message', data);
    });
    socket.on('join-user', (userId) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined for notifications`);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        const HOST = process.env['HOST'] || '::';
        server.listen(Number(PORT), HOST, () => {
            console.log(`🚀 Server running on ${HOST}:${PORT}`);
            console.log(`📊 Environment: ${process.env['NODE_ENV']}`);
            const bracketedHost = HOST.includes(':') ? `[${HOST}]` : HOST;
            console.log(`🔗 Health check: http://${bracketedHost}:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
startServer();
//# sourceMappingURL=index.js.map