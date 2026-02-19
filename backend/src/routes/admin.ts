import { Router } from 'express';
import { getGlobalStats } from '../controllers/admin';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, adminOnly, getGlobalStats);

export default router;
