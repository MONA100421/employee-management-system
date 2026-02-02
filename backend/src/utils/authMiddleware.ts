import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (
  req: Request & { user?: any },
  _res: Response,
  next: NextFunction
) => {
  req.user = {
    id: '000000000000000000000001',
    username: 'employee',
    role: 'employee',
  };
  next();
};
