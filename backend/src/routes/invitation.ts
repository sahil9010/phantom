import express from 'express';
import { sendInvitation, verifyInvitation, acceptInvitation, acceptAndRegister } from '../controllers/invitation';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/', authenticate, sendInvitation);
router.get('/:token', verifyInvitation); // Public to check info before joining
router.post('/:token/accept', authenticate, acceptInvitation);
router.post('/:token/register', acceptAndRegister);

export default router;
