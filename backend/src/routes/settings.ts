import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getSettings);
router.patch('/', authenticate, updateSettings);

export default router;
