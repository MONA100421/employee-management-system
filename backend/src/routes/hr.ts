import { Router } from 'express';

const router = Router();

router.get('/employees', (_req, res) => {
  res.json([]);
});

export default router;
