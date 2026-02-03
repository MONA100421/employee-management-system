import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const authMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  const raw = req.headers['x-user'];

  if (!raw || typeof raw !== 'string') {
    return res.status(401).json({ ok: false, message: 'Unauthenticated' });
  }

  try {
    const user = JSON.parse(raw);

    if (!user.username || !user.role) {
      return res.status(401).json({ ok: false, message: 'Invalid auth user' });
    }

    req.user = {
      id: new mongoose.Types.ObjectId('000000000000000000000001'),
      username: user.username,
      role: user.role,
    };

    next();
  } catch {
    return res.status(401).json({ ok: false, message: 'Invalid auth header' });
  }
};
