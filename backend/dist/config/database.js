"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = globalThis.__prisma || new client_1.PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env['NODE_ENV'] !== 'production') {
    globalThis.__prisma = exports.prisma;
}
const connectDatabase = async () => {
    try {
        await exports.prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await exports.prisma.$disconnect();
        console.log('✅ Database disconnected successfully');
    }
    catch (error) {
        console.error('❌ Database disconnection failed:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=database.js.map