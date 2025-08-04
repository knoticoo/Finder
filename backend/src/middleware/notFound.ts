import { Request, Response, NextFunction } from 'express';

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${_req.originalUrl}`);
  (error as any).statusCode = 404;
  next(error);
};