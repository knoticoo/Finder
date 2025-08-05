"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const notFound = (_req, _res, next) => {
    const error = new Error(`Not Found - ${_req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map