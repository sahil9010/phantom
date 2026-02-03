import express from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../controllers/role';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.get('/', getRoles);
router.post('/', adminOnly, createRole);
router.put('/:id', adminOnly, updateRole);
router.delete('/:id', adminOnly, deleteRole);

export default router;
