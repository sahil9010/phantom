import { Router } from 'express';
import { getAllUsers, searchUsers, getProfile, updateProfile, deleteUser, updateUserRole } from '../controllers/user';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getAllUsers);
router.get('/search', authenticate, searchUsers);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.patch('/:id/role', authenticate, adminOnly, updateUserRole);
router.delete('/:id', authenticate, adminOnly, deleteUser);

export default router;
