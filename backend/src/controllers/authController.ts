import { Request, Response } from 'express';

const demoUsers = [
  { username: 'hr', role: 'hr' },
  { username: 'employee', role: 'employee' }
];

export const loginHandler = (req: Request, res: Response) => {
  const { username, password } = req.body;
  if ( (username === 'hr' && password === 'password123') ||
       (username === 'employee' && password === 'password123') ) {
    const user = demoUsers.find(u => u.username === username);
    return res.json({ ok: true, user: { username: user!.username, role: user!.role } });
  }
  return res.status(401).json({ ok: false, message: 'Invalid credentials' });
};
