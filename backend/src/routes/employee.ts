import { Router } from 'express';

const router = Router();

router.get('/me', (_req, res) => {
  res.json({ message: 'employee profile placeholder' });
});

export default router;
