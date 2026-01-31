import { Router } from 'express';
import { getAllUsers, getProfile, updateProfile } from '../controllers/user';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllUsers);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

export default router;
