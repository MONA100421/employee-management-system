import { Router } from 'express';

const router = Router();

router.post('/login', (_req, res) => {
  res.json({ message: 'login placeholder' });
});

export default router;
